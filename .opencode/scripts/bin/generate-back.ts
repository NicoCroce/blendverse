#!/usr/bin/env node
import { Command } from 'commander';
import { generateBackDomain, parseField } from '../src/generators/back-ddd.js';
import { parseOperations } from '../src/utils/operations.js';

const program = new Command();

program
  .name('generate-back')
  .description('Generate a backend DDD scaffold for a new domain')
  .requiredOption(
    '-e, --entity <name>',
    'Entity name in PascalCase singular (e.g. Product)',
  )
  .requiredOption('-t, --table <name>', 'Database table name (e.g. articulos)')
  .option(
    '-d, --domain <name>',
    'Domain folder name (defaults to entity plural)',
  )
  .requiredOption(
    '-f, --fields <fields>',
    'Comma-separated fields as name:type',
  )
  .option('--filter-fields <fields>', 'Comma-separated filter fields')
  .option('--operations <ops>', 'Comma-separated API operations')
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
    const fields = opts.fields
      .split(',')
      .map((field: string) => parseField(field.trim()));
    const filterFields = opts.filterFields
      ? opts.filterFields
          .split(',')
          .map((field: string) => parseField(field.trim()))
      : undefined;
    const operations = opts.operationsFile
      ? undefined
      : parseOperations(opts.operations);

    console.log(`\nGenerating backend scaffold: ${opts.entity}`);
    console.log(`Table: ${opts.table}`);
    console.log(
      `Operations: ${operations?.join(', ') ?? `from ${opts.operationsFile}`}\n`,
    );

    const generatedFiles = await generateBackDomain({
      entity: opts.entity,
      domain: opts.domain,
      tableName: opts.table,
      fields,
      filterFields,
      operations,
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
