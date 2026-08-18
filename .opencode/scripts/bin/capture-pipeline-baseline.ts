import { resolve } from 'node:path';
import { capturePipelineBaseline } from '../src/validators/pipeline-baseline.js';

const args = process.argv.slice(2);
const valueAfter = (flag: string): string | undefined => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

const projectRoot = resolve(valueAfter('--project-root') ?? process.cwd());
const taskId = valueAfter('--task-id');
const branch = valueAfter('--branch');

if (!taskId || !branch) {
  throw new Error('--task-id and --branch are required');
}

const baseline = await capturePipelineBaseline(projectRoot, taskId, branch);
console.log(JSON.stringify(baseline, null, 2));
