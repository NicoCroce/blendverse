#!/usr/bin/env node
import { Command } from 'commander';
import {
  auditArchitecture,
  formatAuditReport,
} from '../src/analyzers/arch-audit.js';

const program = new Command();

program
  .name('audit-arch')
  .description('Audit project architecture and report deviations')
  .option('--json', 'Output raw JSON instead of formatted report', false)
  .action(async (opts) => {
    console.log('Auditing architecture...\n');

    const report = await auditArchitecture();

    if (opts.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(formatAuditReport(report));
    }
  });

program.parse();
