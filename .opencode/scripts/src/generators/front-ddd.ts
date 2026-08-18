import { join, resolve } from 'node:path';
import {
  getProjectRoot,
  normalizeOperations,
  pathExists,
  readOperationsContract,
  renderTemplate,
  updateFrontendRegistrations,
  writeFileSync,
  type CrudOperation,
  type FrontendView,
} from '../utils/index.js';
import {
  buildNamingContext,
  toCamelCase,
  toPascalCase,
} from '../utils/naming.js';

interface FieldDef {
  name: string;
  type: string;
}

interface FrontGeneratorOptions {
  entity: string;
  domain?: string;
  serverDomain: string;
  filterFields?: FieldDef[];
  operations?: CrudOperation[];
  views?: FrontendView[];
  operationsFile?: string;
  projectRoot?: string;
  force?: boolean;
  dryRun?: boolean;
}

export async function generateFrontDomain(
  options: FrontGeneratorOptions,
): Promise<string[]> {
  const {
    entity,
    domain,
    serverDomain,
    filterFields,
    operations,
    views,
    operationsFile,
    force = false,
    dryRun = false,
  } = options;
  const ctx = buildNamingContext(entity, domain);
  const projectRoot = options.projectRoot ?? getProjectRoot();
  const domainDir = join(projectRoot, 'packages/app/src/Domains', ctx.Domain);
  const templatesDir = resolve(
    new URL('../templates/front', import.meta.url).pathname,
  );

  if ((await pathExists(domainDir)) && !force && !dryRun) {
    throw new Error(
      `Frontend domain already exists: ${domainDir}. Refusing to overwrite it. Use --force only when intentional.`,
    );
  }

  const contract = operationsFile
    ? await readOperationsContract(operationsFile)
    : undefined;
  const normalized = contract ?? normalizeOperations(operations, views);
  const hasOp = (operation: CrudOperation) =>
    normalized.apiOperations.includes(operation);
  const hasView = (view: FrontendView) => normalized.uiViews.includes(view);

  if (hasView('detail') && !hasOp('get')) {
    throw new Error('The detail view requires the get API operation.');
  }

  const templateContext = {
    ...ctx,
    ServerDomain: toPascalCase(serverDomain),
    serverDomain: toCamelCase(serverDomain),
    serverRouterType: `T${toPascalCase(serverDomain)}Router`,
    filterFields: filterFields ?? [],
    hasGetAll: hasOp('getAll'),
    hasGet: hasOp('get'),
    hasCreate: hasOp('create'),
    hasUpdate: hasOp('update'),
    hasDelete: hasOp('delete'),
    hasList: hasView('list'),
    hasDetail: hasView('detail'),
    hasNew: hasView('new'),
    hasEdit: hasView('edit'),
    baseRouteConst: `${ctx.DOMAIN}_ROUTE`,
    detailRouteConst: `${ctx.DOMAIN}_DETAIL_ROUTE`,
    newRouteConst: `${ctx.DOMAIN}_NEW_ROUTE`,
    editRouteConst: `${ctx.DOMAIN}_UPDATE_ROUTE`,
    baseRouteExpression: `{${ctx.DOMAIN}_ROUTE}`,
    detailRouteExpression: `{${ctx.DOMAIN}_DETAIL_ROUTE}`,
    newRouteExpression: `{${ctx.DOMAIN}_NEW_ROUTE}`,
    editRouteExpression: `{${ctx.DOMAIN}_UPDATE_ROUTE}`,
  };

  const filesToGenerate: Array<{ path: string; template: string }> = [
    { path: `${domainDir}/${ctx.Entity}.entity.ts`, template: 'entity.hbs' },
    { path: `${domainDir}/${ctx.Domain}.service.ts`, template: 'service.hbs' },
    { path: `${domainDir}/${ctx.Domain}.routes.ts`, template: 'routes.hbs' },
    { path: `${domainDir}/${ctx.Domain}.router.tsx`, template: 'router.hbs' },
    {
      path: `${domainDir}/Hooks/useCache${ctx.Entities}.ts`,
      template: 'use-cache.hbs',
    },
    {
      path: `${domainDir}/Components/index.ts`,
      template: 'components-index.hbs',
    },
    { path: `${domainDir}/Hooks/index.ts`, template: 'hooks-index.hbs' },
    { path: `${domainDir}/Pages/index.ts`, template: 'pages-index.hbs' },
    { path: `${domainDir}/index.ts`, template: 'domain-root-index.hbs' },
    ...(hasOp('getAll')
      ? [
          {
            path: `${domainDir}/Hooks/useGet${ctx.Entities}.ts`,
            template: 'use-get-all.hbs',
          },
        ]
      : []),
    ...(hasOp('get')
      ? [
          {
            path: `${domainDir}/Hooks/useGet${ctx.Entity}.ts`,
            template: 'use-get.hbs',
          },
        ]
      : []),
    ...(hasOp('create')
      ? [
          {
            path: `${domainDir}/Hooks/useAdd${ctx.Entity}.ts`,
            template: 'use-add.hbs',
          },
        ]
      : []),
    ...(hasOp('update')
      ? [
          {
            path: `${domainDir}/Hooks/useUpdate${ctx.Entity}.ts`,
            template: 'use-update.hbs',
          },
        ]
      : []),
    ...(hasOp('delete')
      ? [
          {
            path: `${domainDir}/Hooks/useDelete${ctx.Entity}.ts`,
            template: 'use-delete.hbs',
          },
        ]
      : []),
    ...(hasView('list')
      ? [
          {
            path: `${domainDir}/Pages/${ctx.Entity}List.page.tsx`,
            template: 'page-list.hbs',
          },
        ]
      : []),
    ...(hasView('detail')
      ? [
          {
            path: `${domainDir}/Pages/${ctx.Entity}Detail.page.tsx`,
            template: 'page-detail.hbs',
          },
        ]
      : []),
    ...(hasView('new')
      ? [
          {
            path: `${domainDir}/Pages/${ctx.Entity}New.page.tsx`,
            template: 'page-new.hbs',
          },
        ]
      : []),
    ...(hasView('edit')
      ? [
          {
            path: `${domainDir}/Pages/${ctx.Entity}Update.page.tsx`,
            template: 'page-update.hbs',
          },
        ]
      : []),
  ];

  const generatedFiles: string[] = [];
  for (const file of filesToGenerate) {
    const content = await renderTemplate(
      join(templatesDir, file.template),
      templateContext,
    );
    if (dryRun) {
      console.log(`[DRY RUN] Would create: ${file.path}`);
    } else {
      await writeFileSync(file.path, content);
      console.log(`Created: ${file.path}`);
    }
    generatedFiles.push(file.path);
  }

  await updateFrontendRegistrations(projectRoot, ctx, dryRun);
  return generatedFiles;
}

export type { FieldDef, FrontGeneratorOptions };
