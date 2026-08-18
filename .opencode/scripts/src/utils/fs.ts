import { access, mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import Handlebars from 'handlebars';

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export async function writeFileSync(
  filePath: string,
  content: string,
): Promise<void> {
  await ensureDir(dirname(filePath));
  await writeFile(filePath, content, 'utf-8');
}

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readFileSync(filePath: string): Promise<string> {
  return readFile(filePath, 'utf-8');
}

export async function listDir(dirPath: string): Promise<string[]> {
  return readdir(dirPath);
}

const templateCache = new Map<string, Handlebars.TemplateDelegate>();

export async function renderTemplate(
  templatePath: string,
  context: Record<string, unknown>,
): Promise<string> {
  const absolutePath = resolve(templatePath);

  if (!templateCache.has(absolutePath)) {
    const source = await readFileSync(absolutePath);
    templateCache.set(absolutePath, Handlebars.compile(source));
  }

  const template = templateCache.get(absolutePath)!;
  return template(context);
}

export function renderString(
  templateStr: string,
  context: Record<string, unknown>,
): string {
  const template = Handlebars.compile(templateStr);
  return template(context);
}

export function getProjectRoot(): string {
  let current = process.cwd();
  while (current !== '/') {
    if (current.endsWith('.opencode/scripts')) {
      return resolve(current, '..', '..');
    }
    current = dirname(current);
  }
  return process.cwd();
}

export function joinPath(...segments: string[]): string {
  return join(...segments);
}
