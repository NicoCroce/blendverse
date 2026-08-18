import assert from 'node:assert/strict';
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ts from 'typescript';
import { generateBackDomain } from '../src/generators/back-ddd.js';
import { generateFrontDomain } from '../src/generators/front-ddd.js';

async function createFixtureRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'opencode-scaffold-'));
  await mkdir(join(root, 'packages/server/src/domains'), { recursive: true });
  await mkdir(join(root, 'packages/server/src/Infrastructure/Routes'), {
    recursive: true,
  });
  await mkdir(join(root, 'packages/app/src/Infrastructure'), {
    recursive: true,
  });
  await writeFile(
    join(root, 'packages/server/src/domains/register.ts'),
    'export const registerDomains = () => ({\n});\n',
  );
  await writeFile(
    join(root, 'packages/server/src/Infrastructure/Routes/Router.ts'),
    'const MainRouter = () => {\n  const AllRouters = {\n  };\n  return AllRouters;\n};\n',
  );
  await writeFile(
    join(root, 'packages/app/src/Infrastructure/Routes.tsx'),
    'export const AllRoutes = [\n];\n',
  );
  return root;
}

async function assertTypeScriptSyntax(directory: string): Promise<void> {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const filePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      await assertTypeScriptSyntax(filePath);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry.name)) continue;
    const source = await readFile(filePath, 'utf8');
    const result = ts.transpileModule(source, {
      fileName: filePath,
      reportDiagnostics: true,
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.Latest,
      },
    });
    assert.equal(
      result.diagnostics?.length ?? 0,
      0,
      `Invalid syntax in ${filePath}`,
    );
  }
}

async function main(): Promise<void> {
  const root = await createFixtureRoot();
  try {
    const contractPath = join(root, 'operations.json');
    await writeFile(
      contractPath,
      JSON.stringify({
        apiOperations: ['getAll', 'get', 'create'],
        uiViews: ['list', 'detail', 'new'],
      }),
    );

    await generateBackDomain({
      projectRoot: root,
      entity: 'Product',
      domain: 'Products',
      tableName: 'productos',
      fields: [
        {
          name: 'name',
          type: 'string',
          zodType: 'z.string()',
          dataType: 'DataTypes.STRING',
          nullable: false,
        },
      ],
      operationsFile: contractPath,
    });

    const backendRoot = join(root, 'packages/server/src/domains/Products');
    assert.equal(
      await readFile(
        join(backendRoot, 'Application/UseCases/GetProduct.usecase.ts'),
        'utf8',
      ).then(() => true),
      true,
    );
    await assert.rejects(() =>
      readFile(
        join(backendRoot, 'Application/UseCases/UpdateProduct.usecase.ts'),
      ),
    );
    const backendRoutes = await readFile(
      join(backendRoot, 'Infrastructure/Routes/Products.routes.ts'),
      'utf8',
    );
    assert.match(backendRoutes, /getAll:/);
    assert.match(backendRoutes, /create:/);
    assert.doesNotMatch(backendRoutes, /update:/);
    await assertTypeScriptSyntax(backendRoot);

    await generateFrontDomain({
      projectRoot: root,
      entity: 'Product',
      domain: 'Catalog',
      serverDomain: 'Products',
      operationsFile: contractPath,
    });

    const frontendRoot = join(root, 'packages/app/src/Domains/Catalog');
    const frontendEntity = await readFile(
      join(frontendRoot, 'Product.entity.ts'),
      'utf8',
    );
    const frontendRouter = await readFile(
      join(frontendRoot, 'Catalog.router.tsx'),
      'utf8',
    );
    const frontendService = await readFile(
      join(frontendRoot, 'Catalog.service.ts'),
      'utf8',
    );
    assert.match(frontendEntity, /TProductsRouter/);
    assert.match(frontendRouter, /path=\{CATALOG_ROUTE\}/);
    assert.match(frontendService, /_catalogService\.products/);
    assert.match(frontendRouter, /ProductDetailPage/);
    await assert.rejects(() =>
      readFile(join(frontendRoot, 'Pages/ProductUpdate.page.tsx')),
    );
    await assertTypeScriptSyntax(frontendRoot);

    await assert.rejects(
      () =>
        generateFrontDomain({
          projectRoot: root,
          entity: 'Product',
          domain: 'Catalog',
          serverDomain: 'Products',
          operationsFile: contractPath,
        }),
      /already exists/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
