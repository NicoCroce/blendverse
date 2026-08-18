#!/usr/bin/env node
import { Command } from 'commander';
import { generateFrontDomain } from '../src/generators/front-ddd.js';
import { parseOperations, parseViews } from '../src/utils/operations.js';

const program = new Command();

program
  .name('generate-front')
  .description('Generate a frontend DDD scaffold for a new domain')
  .requiredOption(
    '-e, --entity <name>',
    'Entity name in PascalCase singular (e.g. Product)',
  )
  .requiredOption('-s, --server-domain <name>', 'Server domain folder name')
  .option(
    '-d, --domain <name>',
    'Frontend domain folder name (defaults to entity plural)',
  )
  .option(
    '-f, --filter-fields <fields>',
    'Comma-separated filter fields as name:type',
  )
  .option('--operations <ops>', 'Comma-separated API operations')
  .option('--views <views>', 'Comma-separated UI views: list,detail,new,edit')
  .option(
    '--operations-file <path>',
    'JSON contract with apiOperations and optional uiViews',
  )
  .option('--force', 'Allow overwriting an existing domain', false)
  .option(
    '--dry-run',
    'Preview files and registrations without writing them',
    false,
  )
  .action(async (opts) => {
    const filterFields = opts.filterFields
      ? opts.filterFields.split(',').map((field: string) => {
          const [name, type = 'string'] = field.trim().split(':');
          return { name, type };
        })
      : undefined;
    const operations = opts.operationsFile
      ? undefined
      : parseOperations(opts.operations);
    const views = opts.operationsFile
      ? undefined
      : parseViews(opts.views, operations!);

    console.log(`\nGenerating frontend scaffold: ${opts.entity}`);
    console.log(`Server domain: ${opts.serverDomain}`);
    console.log(
      `Operations: ${operations?.join(', ') ?? `from ${opts.operationsFile}`}`,
    );
    if (views) console.log(`Views: ${views.join(', ')}`);
    console.log('');

    const generatedFiles = await generateFrontDomain({
      entity: opts.entity,
      domain: opts.domain,
      serverDomain: opts.serverDomain,
      filterFields,
      operations,
      views,
      operationsFile: opts.operationsFile,
      force: opts.force,
      dryRun: opts.dryRun,
    });

    console.log(`\nGenerated ${generatedFiles.length} files.`);
  });

program.parseAsync().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
