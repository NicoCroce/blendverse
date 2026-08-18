import { writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

export type BaselinePackageStatus = 'PASS' | 'FAIL' | 'TIMEOUT' | 'NOT_RUN';

export interface BaselinePackageResult {
  command: string;
  status: BaselinePackageStatus;
  failed_tests: string[];
}

export interface PipelineBaseline {
  task_id: string;
  branch: string;
  captured_at: string;
  packages: {
    server: BaselinePackageResult;
    app: BaselinePackageResult;
  };
}

const timeoutMs = 300_000;

const runVitest = (packageRoot: string): Promise<BaselinePackageResult> =>
  new Promise((resolve) => {
    const command = `cd ${packageRoot} && npx vitest run --no-file-parallelism`;
    const child = spawn('npx', ['vitest', 'run', '--no-file-parallelism'], {
      cwd: packageRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, timeoutMs);

    child.stdout.on('data', (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.stderr.on('data', (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      const failedTests = output
        .split('\n')
        .filter((line) => /FAIL|failed/i.test(line))
        .map((line) => line.trim())
        .filter(Boolean);
      resolve({
        command,
        status: timedOut ? 'TIMEOUT' : code === 0 ? 'PASS' : 'FAIL',
        failed_tests: failedTests,
      });
    });
  });

export const capturePipelineBaseline = async (
  projectRoot: string,
  taskId: string,
  branch: string,
): Promise<PipelineBaseline> => {
  const [server, app] = await Promise.all([
    runVitest(join(projectRoot, 'packages/server')),
    runVitest(join(projectRoot, 'packages/app')),
  ]);
  const baseline: PipelineBaseline = {
    task_id: taskId,
    branch,
    captured_at: new Date().toISOString(),
    packages: { server, app },
  };
  await writeFile(
    join(projectRoot, 'memory', taskId, '00_baseline.json'),
    `${JSON.stringify(baseline, null, 2)}\n`,
  );
  return baseline;
};
