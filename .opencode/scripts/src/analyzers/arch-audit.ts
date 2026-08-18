import { join } from 'node:path';
import { getProjectRoot, listDir, readFileSync } from '../utils/index.js';

interface DomainAuditResult {
  name: string;
  hasDomainLayer: boolean;
  hasApplicationLayer: boolean;
  hasInfrastructureLayer: boolean;
  hasDiFile: boolean;
  hasTypesFile: boolean;
  hasLegacyTypesInDomain: boolean;
  isRegistered: boolean;
  hasCompleteInfrastructure: boolean;
  deviations: string[];
}

interface FrontDomainAuditResult {
  name: string;
  usesInferRouterOutputs: boolean;
  hasHooks: boolean;
  routesExtension: string;
  deviations: string[];
}

interface AuditReport {
  serverDomains: DomainAuditResult[];
  frontDomains: FrontDomainAuditResult[];
  globalIssues: string[];
  summary: {
    totalServerDomains: number;
    totalFrontDomains: number;
    criticalDeviations: number;
    infraDeviations: number;
  };
}

export async function auditArchitecture(): Promise<AuditReport> {
  const projectRoot = getProjectRoot();
  const serverDomainsDir = join(projectRoot, 'packages/server/src/domains');
  const frontDomainsDir = join(projectRoot, 'packages/app/src/Domains');

  const serverDomains = await auditServerDomains(serverDomainsDir);
  const frontDomains = await auditFrontDomains(frontDomainsDir);
  const globalIssues = await checkGlobalIssues(projectRoot);

  const criticalDeviations =
    serverDomains.reduce(
      (sum, d) =>
        sum +
        d.deviations.filter(
          (dev) => dev.startsWith('B1') || dev.startsWith('B3'),
        ).length,
      0,
    ) +
    frontDomains.reduce(
      (sum, d) =>
        sum + d.deviations.filter((dev) => dev.startsWith('D1')).length,
      0,
    );

  const infraDeviations = globalIssues.length;

  return {
    serverDomains,
    frontDomains,
    globalIssues,
    summary: {
      totalServerDomains: serverDomains.length,
      totalFrontDomains: frontDomains.length,
      criticalDeviations,
      infraDeviations,
    },
  };
}

async function auditServerDomains(
  domainsDir: string,
): Promise<DomainAuditResult[]> {
  const entries = await listDir(domainsDir);
  const domainNames = entries.filter(
    (e) => !e.startsWith('.') && !e.endsWith('.ts') && !e.endsWith('.tsx'),
  );

  const registerContent = await readFileSync(join(domainsDir, 'register.ts'));

  const results: DomainAuditResult[] = [];

  for (const domainName of domainNames) {
    const domainPath = join(domainsDir, domainName);
    const domainEntries = await listDir(domainPath);

    const hasDomainLayer = domainEntries.includes('Domain');
    const hasApplicationLayer = domainEntries.includes('Application');
    const hasInfrastructureLayer = domainEntries.includes('Infrastructure');
    const hasDiFile = domainEntries.some((e) => e.endsWith('.di.ts'));

    let hasTypesFile = false;
    let hasLegacyTypesInDomain = false;

    if (hasApplicationLayer) {
      const appEntries = await listDir(join(domainPath, 'Application'));
      hasTypesFile = appEntries.some((e) => e.endsWith('.types.ts'));
    }

    if (hasDomainLayer) {
      const domainLayerEntries = await listDir(join(domainPath, 'Domain'));
      hasLegacyTypesInDomain = domainLayerEntries.some(
        (e) => e.includes('interfaces') || e.includes('types'),
      );
    }

    const domainCamel =
      domainName.charAt(0).toLowerCase() + domainName.slice(1);
    const isRegistered = registerContent.includes(`${domainCamel}App`);

    let hasCompleteInfrastructure = false;
    if (hasInfrastructureLayer) {
      const infraEntries = await listDir(join(domainPath, 'Infrastructure'));
      hasCompleteInfrastructure =
        infraEntries.includes('Controllers') &&
        infraEntries.includes('Database') &&
        infraEntries.includes('Routes');
    }

    const deviations: string[] = [];
    if (hasLegacyTypesInDomain) deviations.push('B1: Legacy types in Domain/');
    if (hasDiFile && !hasLegacyTypesInDomain)
      deviations.push('B3: Has .di.ts (consolidation candidate)');
    if (!isRegistered) deviations.push('NOT_REGISTERED');
    if (!hasCompleteInfrastructure && hasInfrastructureLayer)
      deviations.push('INCOMPLETE_INFRA');
    if (!hasDomainLayer && !hasApplicationLayer) deviations.push('STUB');

    results.push({
      name: domainName,
      hasDomainLayer,
      hasApplicationLayer,
      hasInfrastructureLayer,
      hasDiFile,
      hasTypesFile,
      hasLegacyTypesInDomain,
      isRegistered,
      hasCompleteInfrastructure,
      deviations,
    });
  }

  return results;
}

async function auditFrontDomains(
  domainsDir: string,
): Promise<FrontDomainAuditResult[]> {
  const entries = await listDir(domainsDir);
  const domainNames = entries.filter(
    (e) =>
      !e.startsWith('.') &&
      !e.endsWith('.ts') &&
      !e.endsWith('.tsx') &&
      e !== 'index.ts',
  );

  const results: FrontDomainAuditResult[] = [];

  for (const domainName of domainNames) {
    const domainPath = join(domainsDir, domainName);
    const domainEntries = await listDir(domainPath);

    const entityFile = domainEntries.find((e) => e.endsWith('.entity.ts'));
    let usesInferRouterOutputs = false;

    if (entityFile) {
      const content = await readFileSync(join(domainPath, entityFile));
      usesInferRouterOutputs = content.includes('inferRouterOutputs');
    }

    const hasHooks = domainEntries.includes('Hooks');

    const routesFile = domainEntries.find((e) => e.includes('.routes.'));
    const routesExtension = routesFile?.endsWith('.tsx')
      ? '.tsx'
      : routesFile?.endsWith('.ts')
        ? '.ts'
        : 'none';

    const deviations: string[] = [];
    if (!usesInferRouterOutputs)
      deviations.push('D1: Does not use inferRouterOutputs');
    if (!hasHooks) deviations.push('NO_HOOKS');
    if (routesExtension === '.tsx')
      deviations.push('ROUTES_TSX: Should be .ts');

    results.push({
      name: domainName,
      usesInferRouterOutputs,
      hasHooks,
      routesExtension,
      deviations,
    });
  }

  return results;
}

async function checkGlobalIssues(projectRoot: string): Promise<string[]> {
  const issues: string[] = [];

  try {
    const appUtilsDir = join(
      projectRoot,
      'packages/server/src/Application/Utils',
    );
    const entries = await listDir(appUtilsDir);
    if (entries.length > 0) {
      issues.push(
        `B4: Infrastructure in Application/Utils/ (${entries.join(', ')})`,
      );
    }
  } catch {
    // Directory doesn't exist, no issue
  }

  return issues;
}

export function formatAuditReport(report: AuditReport): string {
  const lines: string[] = [];

  lines.push('## Audit Report - Server Domains\n');
  lines.push(
    '| Domain | Layers | .di.ts | Types | Legacy Types | Registered | Infra | Deviations |',
  );
  lines.push(
    '|--------|--------|--------|-------|--------------|------------|-------|------------|',
  );

  for (const d of report.serverDomains) {
    const layers =
      [
        d.hasDomainLayer && 'D',
        d.hasApplicationLayer && 'A',
        d.hasInfrastructureLayer && 'I',
      ]
        .filter(Boolean)
        .join('') || 'NONE';

    lines.push(
      `| ${d.name} | ${layers} | ${d.hasDiFile ? 'Y' : 'N'} | ${d.hasTypesFile ? 'Y' : 'N'} | ${d.hasLegacyTypesInDomain ? 'YES (B1)' : 'N'} | ${d.isRegistered ? 'Y' : 'N'} | ${d.hasCompleteInfrastructure ? 'Y' : 'N'} | ${d.deviations.join(', ') || 'OK'} |`,
    );
  }

  lines.push('\n## Audit Report - Frontend Domains\n');
  lines.push(
    '| Domain | inferRouterOutputs | Hooks | Routes Ext | Deviations |',
  );
  lines.push(
    '|--------|-------------------|-------|------------|------------|',
  );

  for (const d of report.frontDomains) {
    lines.push(
      `| ${d.name} | ${d.usesInferRouterOutputs ? 'Y' : 'N (D1)'} | ${d.hasHooks ? 'Y' : 'N'} | ${d.routesExtension} | ${d.deviations.join(', ') || 'OK'} |`,
    );
  }

  if (report.globalIssues.length > 0) {
    lines.push('\n## Global Issues\n');
    for (const issue of report.globalIssues) {
      lines.push(`- ${issue}`);
    }
  }

  lines.push('\n## Summary\n');
  lines.push(`- Server domains: ${report.summary.totalServerDomains}`);
  lines.push(`- Frontend domains: ${report.summary.totalFrontDomains}`);
  lines.push(
    `- Critical deviations (B1, B3, D1): ${report.summary.criticalDeviations}`,
  );
  lines.push(
    `- Infrastructure deviations (B4): ${report.summary.infraDeviations}`,
  );

  return lines.join('\n');
}

export type { DomainAuditResult, FrontDomainAuditResult, AuditReport };
