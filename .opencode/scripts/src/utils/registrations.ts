import { join } from 'node:path';
import { readFileSync, writeFileSync } from './fs.js';
import type { NamingContext } from './naming.js';

async function updateTextFile(
  filePath: string,
  update: (content: string) => string,
  dryRun: boolean,
): Promise<void> {
  const current = await readFileSync(filePath);
  const next = update(current);
  if (current === next) return;
  if (dryRun) {
    console.log(`[DRY RUN] Would update: ${filePath}`);
    return;
  }
  await writeFileSync(filePath, next);
  console.log(`Updated: ${filePath}`);
}

function addImport(content: string, statement: string): string {
  return content.includes(statement) ? content : `${statement}\n${content}`;
}

function addSpreadBeforeClosing(
  content: string,
  spread: string,
  closing: string,
): string {
  if (content.includes(spread)) return content;
  const index = content.lastIndexOf(closing);
  if (index === -1)
    throw new Error(`Could not find registration closing token: ${closing}`);
  return `${content.slice(0, index)}  ${spread}\n${content.slice(index)}`;
}

export async function updateBackendRegistrations(
  projectRoot: string,
  ctx: NamingContext,
  dryRun: boolean,
): Promise<void> {
  const registerPath = join(
    projectRoot,
    'packages/server/src/domains/register.ts',
  );
  const routerPath = join(
    projectRoot,
    'packages/server/src/Infrastructure/Routes/Router.ts',
  );

  await updateTextFile(
    registerPath,
    (content) => {
      const withImport = addImport(
        content,
        `import { ${ctx.domain}App } from './${ctx.Domain}';`,
      );
      return addSpreadBeforeClosing(
        withImport,
        `...${ctx.domain}App,`,
        '\n});',
      );
    },
    dryRun,
  );

  await updateTextFile(
    routerPath,
    (content) => {
      const withImport = addImport(
        content,
        `import { ${ctx.Domain}Routes } from '@server/domains/${ctx.Domain}';`,
      );
      return addSpreadBeforeClosing(
        withImport,
        `...${ctx.Domain}Routes(),`,
        '\n  };',
      );
    },
    dryRun,
  );
}

export async function updateFrontendRegistrations(
  projectRoot: string,
  ctx: NamingContext,
  dryRun: boolean,
): Promise<void> {
  const routesPath = join(
    projectRoot,
    'packages/app/src/Infrastructure/Routes.tsx',
  );

  await updateTextFile(
    routesPath,
    (content) => {
      const withImport = addImport(
        content,
        `import { ${ctx.Domain}Router } from '@app/Domains/${ctx.Domain}';`,
      );
      return addSpreadBeforeClosing(
        withImport,
        `  ${ctx.Domain}Router,`,
        '\n];',
      );
    },
    dryRun,
  );
}
