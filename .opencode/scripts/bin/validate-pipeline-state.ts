import { resolve } from 'node:path';
import { validatePipelineState } from '../src/validators/pipeline-state.js';

const args = process.argv.slice(2);
const projectRootIndex = args.indexOf('--project-root');
const taskIdIndex = args.indexOf('--task-id');
const projectRoot = resolve(
  projectRootIndex >= 0
    ? (args[projectRootIndex + 1] ?? process.cwd())
    : process.cwd(),
);
const taskId = taskIdIndex >= 0 ? args[taskIdIndex + 1] : undefined;

const result = await validatePipelineState(projectRoot, taskId);

for (const warning of result.warnings) console.warn(`WARN: ${warning}`);
for (const error of result.errors) console.error(`ERROR: ${error}`);

if (result.errors.length > 0) process.exitCode = 1;
