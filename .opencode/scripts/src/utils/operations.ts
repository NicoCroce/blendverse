import { readFile } from 'node:fs/promises';

export const CRUD_OPERATIONS = [
  'getAll',
  'get',
  'create',
  'update',
  'delete',
] as const;
export type CrudOperation = (typeof CRUD_OPERATIONS)[number];

export const FRONTEND_VIEWS = ['list', 'detail', 'new', 'edit'] as const;
export type FrontendView = (typeof FRONTEND_VIEWS)[number];

export interface OperationsContract {
  apiOperations: CrudOperation[];
  uiViews?: FrontendView[];
}

export interface NormalizedOperations {
  apiOperations: CrudOperation[];
  uiViews: FrontendView[];
}

const DEFAULT_OPERATIONS: CrudOperation[] = [...CRUD_OPERATIONS];

export function parseOperations(value: string | undefined): CrudOperation[] {
  const rawValues = value
    ?.split(',')
    .map((operation) => operation.trim())
    .filter(Boolean);
  const values = rawValues?.length ? rawValues : DEFAULT_OPERATIONS;
  const invalid = values.filter(
    (operation): operation is string =>
      !CRUD_OPERATIONS.includes(operation as CrudOperation),
  );

  if (invalid.length > 0) {
    throw new Error(
      `Invalid operations: ${invalid.join(', ')}. Valid operations: ${CRUD_OPERATIONS.join(', ')}`,
    );
  }

  return [...new Set(values)] as CrudOperation[];
}

export function parseViews(
  value: string | undefined,
  operations: CrudOperation[],
): FrontendView[] {
  const rawValues = value
    ?.split(',')
    .map((view) => view.trim())
    .filter(Boolean);
  const values = rawValues?.length
    ? rawValues
    : [
        ...(operations.includes('getAll') ? ['list'] : []),
        ...(operations.includes('get') ? ['detail'] : []),
        ...(operations.includes('create') ? ['new'] : []),
        ...(operations.includes('update') ? ['edit'] : []),
      ];
  const invalid = values.filter(
    (view): view is string => !FRONTEND_VIEWS.includes(view as FrontendView),
  );

  if (invalid.length > 0) {
    throw new Error(
      `Invalid UI views: ${invalid.join(', ')}. Valid views: ${FRONTEND_VIEWS.join(', ')}`,
    );
  }

  return [...new Set(values)] as FrontendView[];
}

export function normalizeOperations(
  operations: string | CrudOperation[] | undefined,
  views?: string | FrontendView[],
): NormalizedOperations {
  const apiOperations = Array.isArray(operations)
    ? parseOperations(operations.join(','))
    : parseOperations(operations);
  const uiViews = Array.isArray(views)
    ? parseViews(views.join(','), apiOperations)
    : parseViews(views, apiOperations);

  return { apiOperations, uiViews };
}

export async function readOperationsContract(
  filePath: string,
): Promise<NormalizedOperations> {
  const raw = JSON.parse(await readFile(filePath, 'utf-8')) as
    | OperationsContract
    | CrudOperation[];

  if (Array.isArray(raw)) {
    return normalizeOperations(raw);
  }

  if (!raw || !Array.isArray(raw.apiOperations)) {
    throw new Error(
      `Invalid operations contract: ${filePath}. Expected an apiOperations array.`,
    );
  }

  return normalizeOperations(raw.apiOperations, raw.uiViews);
}
