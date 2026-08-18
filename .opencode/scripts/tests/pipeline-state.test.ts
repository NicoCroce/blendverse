import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validatePipelineState } from '../src/validators/pipeline-state.js';

const main = async (): Promise<void> => {
  const root = await mkdtemp(join(tmpdir(), 'opencode-pipeline-state-'));
  try {
    const taskId = 'TASK-test-20260817-1';
    const taskRoot = join(root, 'memory', taskId);
    await mkdir(taskRoot, { recursive: true });
    await writeFile(
      join(root, 'memory', 'history_log.json'),
      JSON.stringify({ tasks: [{ task_id: taskId, status: 'IN_PROGRESS' }] }),
    );
    await writeFile(
      join(taskRoot, '.checkpoint.json'),
      JSON.stringify({
        task_id: taskId,
        completed_steps: ['back'],
        pending_steps: ['tester', 'qa'],
        last_completed_step: 'back',
      }),
    );
    await writeFile(
      join(taskRoot, '02_dev_log.md'),
      `---\ntask_id: '${taskId}'\nattempts: 1\n---\n`,
    );

    const valid = await validatePipelineState(root, taskId);
    assert.deepEqual(valid.errors, []);

    await writeFile(
      join(taskRoot, '.checkpoint.json'),
      JSON.stringify({
        task_id: taskId,
        completed_steps: ['back'],
        pending_steps: ['back', 'qa'],
        last_completed_step: 'tester',
      }),
    );
    const invalid = await validatePipelineState(root, taskId);
    assert.equal(invalid.errors.length, 2);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
};

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
