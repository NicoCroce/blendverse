import { Project, SourceFile } from 'ts-morph';

export function createTsProject(rootDir: string): Project {
  return new Project({
    tsConfigFilePath: `${rootDir}/tsconfig.json`,
    skipAddingFilesFromTsConfig: true,
  });
}

export function updateImports(
  sourceFile: SourceFile,
  oldModuleSpecifier: string,
  newModuleSpecifier: string,
  namedImports: string[],
): void {
  const existingImport = sourceFile.getImportDeclaration(
    (decl) => decl.getModuleSpecifierValue() === oldModuleSpecifier,
  );

  if (existingImport) {
    const existingNamedImports = existingImport
      .getNamedImports()
      .map((n) => n.getName());
    const allNamedImports = [
      ...new Set([...existingNamedImports, ...namedImports]),
    ];

    existingImport.remove();
    sourceFile.addImportDeclaration({
      moduleSpecifier: newModuleSpecifier,
      namedImports: allNamedImports,
    });
  } else {
    sourceFile.addImportDeclaration({
      moduleSpecifier: newModuleSpecifier,
      namedImports,
    });
  }
}

export function removeImport(
  sourceFile: SourceFile,
  moduleSpecifier: string,
  namedImports?: string[],
): void {
  const importDecl = sourceFile.getImportDeclaration(
    (decl) => decl.getModuleSpecifierValue() === moduleSpecifier,
  );

  if (!importDecl) return;

  if (!namedImports) {
    importDecl.remove();
    return;
  }

  const existingNamedImports = importDecl.getNamedImports();
  const remainingImports = existingNamedImports.filter(
    (n) => !namedImports.includes(n.getName()),
  );

  if (remainingImports.length === 0) {
    importDecl.remove();
  } else {
    importDecl.remove();
    sourceFile.addImportDeclaration({
      moduleSpecifier,
      namedImports: remainingImports.map((n) => n.getName()),
    });
  }
}

export function addExportDeclaration(
  sourceFile: SourceFile,
  exportPath: string,
): void {
  const existing = sourceFile
    .getExportDeclarations()
    .find((decl) => decl.getModuleSpecifierValue() === exportPath);

  if (!existing) {
    sourceFile.addExportDeclaration({ moduleSpecifier: exportPath });
  }
}

export function removeExportDeclaration(
  sourceFile: SourceFile,
  exportPath: string,
): void {
  const existing = sourceFile
    .getExportDeclarations()
    .find((decl) => decl.getModuleSpecifierValue() === exportPath);

  if (existing) {
    existing.remove();
  }
}

export function hasImportFrom(
  sourceFile: SourceFile,
  pattern: RegExp,
): boolean {
  return sourceFile
    .getImportDeclarations()
    .some((decl) => pattern.test(decl.getModuleSpecifierValue()));
}

export function getImportedNames(
  sourceFile: SourceFile,
  moduleSpecifier: string,
): string[] {
  const importDecl = sourceFile.getImportDeclaration(
    (decl) => decl.getModuleSpecifierValue() === moduleSpecifier,
  );

  if (!importDecl) return [];
  return importDecl.getNamedImports().map((n) => n.getName());
}

export function findFilesWithPattern(
  project: Project,
  globPattern: string,
): SourceFile[] {
  return project.addSourceFilesAtPaths(globPattern);
}

export function containsText(sourceFile: SourceFile, text: string): boolean {
  return sourceFile.getFullText().includes(text);
}

export function replaceText(
  sourceFile: SourceFile,
  searchText: string,
  replaceText: string,
): boolean {
  const fullText = sourceFile.getFullText();
  if (!fullText.includes(searchText)) return false;
  sourceFile.replaceWithText(fullText.replace(searchText, replaceText));
  return true;
}

export function addSpreadProperty(
  sourceFile: SourceFile,
  objectLiteralText: string,
  spreadExpression: string,
): boolean {
  const fullText = sourceFile.getFullText();
  const idx = fullText.indexOf(objectLiteralText);
  if (idx === -1) return false;

  const newContent = fullText.replace(
    objectLiteralText,
    `${objectLiteralText.replace(/\}$/, '')}  ...${spreadExpression},\n}`,
  );
  sourceFile.replaceWithText(newContent);
  return true;
}
