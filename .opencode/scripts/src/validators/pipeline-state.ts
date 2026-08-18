import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export type PipelineStatus = 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';

export interface PipelineTask {
  task_id: string;
  status: PipelineStatus;
  [key: string]: unknown;
}

export interface PipelineHistory {
  tasks: PipelineTask[];
}

export interface PipelineValidationResult {
  errors: string[];
  warnings: string[];
}

const readJson = async <T>(filePath: string): Promise<T> =>
  JSON.parse(await readFile(filePath, 'utf8')) as T;

const readFrontmatter = async (filePath: string): Promise<string> => {
  const content = await readFile(filePath, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  return match?.[1] ?? '';
};

const getFrontmatterValue = (
  frontmatter: string,
  key: string,
): string | undefined =>
  frontmatter
    .split('\n')
    .find((line) => line.startsWith(`${key}:`))
    ?.slice(key.length + 1)
    .trim()
    .replace(/^['"]|['"]$/g, '');

const hasFile = async (filePath: string): Promise<boolean> => {
  try {
    await readFile(filePath);
    return true;
  } catch {
    return false;
  }
};

const validateHistory = (
  history: unknown,
  errors: string[],
): PipelineHistory | null => {
  if (
    !history ||
    typeof history !== 'object' ||
    !Array.isArray((history as { tasks?: unknown }).tasks)
  ) {
    errors.push(
      'history_log.json must use the canonical { "tasks": [] } shape',
    );
    return null;
  }

  const tasks = (history as { tasks: unknown[] }).tasks;
  const ids = new Set<string>();
  const normalizedTasks: PipelineTask[] = [];

  tasks.forEach((task, index) => {
    if (!task || typeof task !== 'object') {
      errors.push(`history_log.tasks[${index}] must be an object`);
      return;
    }

    const candidate = task as Partial<PipelineTask>;
    if (!candidate.task_id || typeof candidate.task_id !== 'string') {
      errors.push(`history_log.tasks[${index}] is missing task_id`);
      return;
    }
    if (ids.has(candidate.task_id)) {
      errors.push(
        `history_log contains duplicate task_id ${candidate.task_id}`,
      );
    }
    ids.add(candidate.task_id);
    if (
      !['IN_PROGRESS', 'COMPLETED', 'BLOCKED'].includes(candidate.status ?? '')
    ) {
      errors.push(`${candidate.task_id} has an invalid status`);
    }
    normalizedTasks.push(candidate as PipelineTask);
  });

  return { tasks: normalizedTasks };
};

const validateCheckpoint = async (
  projectRoot: string,
  task: PipelineTask,
  errors: string[],
): Promise<void> => {
  const checkpointPath = join(
    projectRoot,
    'memory',
    task.task_id,
    '.checkpoint.json',
  );
  if (!(await hasFile(checkpointPath))) return;

  const checkpoint = await readJson<{
    task_id?: string;
    completed_steps?: unknown;
    pending_steps?: unknown;
    last_completed_step?: string;
  }>(checkpointPath);
  const completed = checkpoint.completed_steps;
  const pending = checkpoint.pending_steps;

  if (checkpoint.task_id !== task.task_id) {
    errors.push(
      `${task.task_id} checkpoint task_id does not match its directory`,
    );
  }
  if (!Array.isArray(completed) || !Array.isArray(pending)) {
    errors.push(
      `${task.task_id} checkpoint must contain completed_steps and pending_steps arrays`,
    );
    return;
  }

  const completedSet = new Set(
    completed.filter((step): step is string => typeof step === 'string'),
  );
  const pendingSet = new Set(
    pending.filter((step): step is string => typeof step === 'string'),
  );
  const overlap = [...completedSet].filter((step) => pendingSet.has(step));
  if (overlap.length > 0) {
    errors.push(
      `${task.task_id} checkpoint overlaps completed and pending steps: ${overlap.join(', ')}`,
    );
  }
  if (
    checkpoint.last_completed_step &&
    !completedSet.has(checkpoint.last_completed_step)
  ) {
    errors.push(
      `${task.task_id} checkpoint last_completed_step is not in completed_steps`,
    );
  }
};

const validateTaskArtifacts = async (
  projectRoot: string,
  task: PipelineTask,
  errors: string[],
  warnings: string[],
): Promise<void> => {
  const taskRoot = join(projectRoot, 'memory', task.task_id);
  const blockedPath = join(taskRoot, 'BLOCKED.md');
  const blockedExists = await hasFile(blockedPath);

  if (task.status === 'BLOCKED' && !blockedExists) {
    errors.push(
      `${task.task_id} is BLOCKED in history but has no task-scoped BLOCKED.md`,
    );
  }
  if (task.status !== 'BLOCKED' && blockedExists) {
    warnings.push(
      `${task.task_id} has BLOCKED.md but history status is ${task.status}`,
    );
  }

  for (const report of [
    '02_dev_log.md',
    '03_qa_report.md',
    '04_review_log.md',
    '05_test_log.md',
  ]) {
    const reportPath = join(taskRoot, report);
    if (!(await hasFile(reportPath))) continue;
    const frontmatter = await readFrontmatter(reportPath);
    if (!frontmatter) {
      warnings.push(
        `${task.task_id}/${report} uses the legacy report format without frontmatter`,
      );
      continue;
    }
    if (getFrontmatterValue(frontmatter, 'task_id') !== task.task_id) {
      errors.push(`${task.task_id}/${report} has a mismatched task_id`);
    }
    const attempts = Number(getFrontmatterValue(frontmatter, 'attempts'));
    if (!Number.isInteger(attempts) || attempts < 1) {
      errors.push(`${task.task_id}/${report} has an invalid attempts value`);
    }
  }

  await validateCheckpoint(projectRoot, task, errors);
};

export const validatePipelineState = async (
  projectRoot: string,
  taskId?: string,
): Promise<PipelineValidationResult> => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const historyPath = join(projectRoot, 'memory', 'history_log.json');
  const history = validateHistory(await readJson<unknown>(historyPath), errors);

  if (!history) return { errors, warnings };

  const tasks = taskId
    ? history.tasks.filter((task) => task.task_id === taskId)
    : history.tasks;
  if (taskId && tasks.length === 0) {
    errors.push(`task_id ${taskId} is not registered in history_log.json`);
  }

  for (const task of tasks) {
    await validateTaskArtifacts(projectRoot, task, errors, warnings);
  }

  if (await hasFile(join(projectRoot, 'memory', 'BLOCKED.md'))) {
    warnings.push(
      'memory/BLOCKED.md is a legacy global marker; use memory/{task_id}/BLOCKED.md',
    );
  }

  return { errors, warnings };
};
