import { resolve, join } from 'node:path';
import {
  getProjectRoot,
  normalizeOperations,
  pathExists,
  readOperationsContract,
  renderTemplate,
  writeFileSync,
  updateBackendRegistrations,
  type CrudOperation,
} from '../utils/index.js';
import { buildNamingContext } from '../utils/naming.js';

interface FieldDef {
  name: string;
  type: string;
  zodType: string;
  dataType: string;
  nullable: boolean;
}

interface BackGeneratorOptions {
  entity: string;
  domain?: string;
  tableName: string;
  fields: FieldDef[];
  filterFields?: FieldDef[];
  operations?: CrudOperation[];
  operationsFile?: string;
  projectRoot?: string;
  force?: boolean;
  dryRun?: boolean;
}

function parseField(raw: string): FieldDef {
  const [name, type] = raw.split(':').map((s) => s.trim());
  if (!name || !type) {
    throw new Error(`Invalid field "${raw}". Expected format: name:type`);
  }
  const zodType = tsTypeToZod(type);
  const dataType = tsTypeToSequelize(type);
  return { name, type, zodType, dataType, nullable: false };
}

function tsTypeToZod(tsType: string): string {
  switch (tsType) {
    case 'string':
      return 'z.string().min(1)';
    case 'number':
      return 'z.number()';
    case 'boolean':
      return 'z.boolean()';
    case 'Date':
    case 'date':
      return 'z.string().datetime()';
    default:
      return 'z.string()';
  }
}

function tsTypeToSequelize(tsType: string): string {
  switch (tsType) {
    case 'string':
      return 'DataTypes.STRING';
    case 'number':
      return 'DataTypes.INTEGER';
    case 'boolean':
      return 'DataTypes.BOOLEAN';
    case 'Date':
    case 'date':
      return 'DataTypes.DATE';
    default:
      return 'DataTypes.STRING';
  }
}

export async function generateBackDomain(
  options: BackGeneratorOptions,
): Promise<string[]> {
  const {
    entity,
    domain,
    tableName,
    fields,
    filterFields,
    operations,
    operationsFile,
    force = false,
    dryRun = false,
  } = options;
  const ctx = buildNamingContext(entity, domain);
  const projectRoot = options.projectRoot ?? getProjectRoot();
  const domainDir = join(
    projectRoot,
    'packages/server/src/domains',
    ctx.Domain,
  );
  const templatesDir = resolve(
    new URL('../templates/back', import.meta.url).pathname,
  );

  if ((await pathExists(domainDir)) && !force && !dryRun) {
    throw new Error(
      `Domain already exists: ${domainDir}. Refusing to overwrite it. Use --force only when intentional.`,
    );
  }

  const contract = operationsFile
    ? await readOperationsContract(operationsFile)
    : undefined;
  const ops =
    contract?.apiOperations ?? normalizeOperations(operations).apiOperations;
  const hasOp = (op: CrudOperation) => ops.includes(op);

  const templateContext = {
    ...ctx,
    fields,
    entityProps: fields,
    createFields: fields,
    updateFields: fields,
    filterFields:
      filterFields ?? fields.filter((f) => f.type === 'string').slice(0, 1),
    tableName,
    // Flags para templates condicionales
    hasGetAll: hasOp('getAll'),
    hasGet: hasOp('get'),
    hasCreate: hasOp('create'),
    hasUpdate: hasOp('update'),
    hasDelete: hasOp('delete'),
    hasValidation: hasOp('create') || hasOp('update'),
  };

  const filesToGenerate: Array<{ path: string; template: string }> = [
    // Archivos siempre generados
    {
      path: `${domainDir}/Domain/${ctx.Entity}.entity.ts`,
      template: 'entity.hbs',
    },
    {
      path: `${domainDir}/Domain/${ctx.Entity}.repository.ts`,
      template: 'repository.hbs',
    },
    { path: `${domainDir}/Domain/index.ts`, template: 'domain-index.hbs' },
    {
      path: `${domainDir}/Application/${ctx.domain}.types.ts`,
      template: 'types.hbs',
    },
    {
      path: `${domainDir}/Application/${ctx.Domain}.service.ts`,
      template: 'service.hbs',
    },
    {
      path: `${domainDir}/Application/index.ts`,
      template: 'application-index.hbs',
    },
    {
      path: `${domainDir}/Infrastructure/Controllers/${ctx.Domain}.controller.ts`,
      template: 'controller.hbs',
    },
    {
      path: `${domainDir}/Infrastructure/Controllers/index.ts`,
      template: 'controllers-index.hbs',
    },
    {
      path: `${domainDir}/Infrastructure/Database/${ctx.Entity}.model.ts`,
      template: 'model.hbs',
    },
    {
      path: `${domainDir}/Infrastructure/Database/${ctx.Entity}Repository.implementation.ts`,
      template: 'repository-impl.hbs',
    },
    {
      path: `${domainDir}/Infrastructure/Database/index.ts`,
      template: 'database-index.hbs',
    },
    {
      path: `${domainDir}/Infrastructure/Routes/${ctx.Domain}.routes.ts`,
      template: 'routes.hbs',
    },
    {
      path: `${domainDir}/Infrastructure/Routes/index.ts`,
      template: 'routes-index.hbs',
    },
    {
      path: `${domainDir}/Infrastructure/index.ts`,
      template: 'infrastructure-index.hbs',
    },
    { path: `${domainDir}/${ctx.domain}.di.ts`, template: 'di.hbs' },
    { path: `${domainDir}/index.ts`, template: 'domain-root-index.hbs' },

    // Use cases condicionales
    ...(hasOp('getAll')
      ? [
          {
            path: `${domainDir}/Application/UseCases/GetAll${ctx.Entities}.usecase.ts`,
            template: 'get-all-usecase.hbs',
          },
        ]
      : []),
    ...(hasOp('get')
      ? [
          {
            path: `${domainDir}/Application/UseCases/Get${ctx.Entity}.usecase.ts`,
            template: 'get-usecase.hbs',
          },
        ]
      : []),
    ...(hasOp('create')
      ? [
          {
            path: `${domainDir}/Application/UseCases/Create${ctx.Entity}.usecase.ts`,
            template: 'create-usecase.hbs',
          },
        ]
      : []),
    ...(hasOp('update')
      ? [
          {
            path: `${domainDir}/Application/UseCases/Update${ctx.Entity}.usecase.ts`,
            template: 'update-usecase.hbs',
          },
        ]
      : []),
    ...(hasOp('delete')
      ? [
          {
            path: `${domainDir}/Application/UseCases/Delete${ctx.Entity}.usecase.ts`,
            template: 'delete-usecase.hbs',
          },
        ]
      : []),

    // Index de use cases (siempre generado, contenido condicional)
    {
      path: `${domainDir}/Application/UseCases/index.ts`,
      template: 'usecases-index.hbs',
    },
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

  await updateBackendRegistrations(projectRoot, ctx, dryRun);

  return generatedFiles;
}

export { parseField, type FieldDef, type BackGeneratorOptions };
