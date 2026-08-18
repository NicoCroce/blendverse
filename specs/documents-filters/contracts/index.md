# Contracts — Documents Filters (Estado de Conformidad)

_Phase 1 output. Interfaces y schemas afectados con los cambios propuestos._

## C1. `TStateDocument` — server

**Archivo**: `packages/server/src/domains/Documents/Domain/Document.types.ts`

**Antes** (línea 1):

```ts
export type TStateDocument = 'validados' | 'pendientes';
```

**Propuesto**:

```ts
export type TStateDocument =
  | 'pendientes'
  | 'bajo_conformidad'
  | 'sin_conformidad'
  | 'validados'; // legacy: solo compatibilidad de URLs, sin opción de UI
```

## C2. `z.enum` del controller — server

**Archivo**: `packages/server/src/domains/Documents/Infrastructure/Controllers/Documents.controller.ts` (línea 18)

**Antes**:

```ts
state: z.enum(['validados', 'pendientes']).default('pendientes'),
```

**Propuesto**:

```ts
state: z
  .enum(['pendientes', 'bajo_conformidad', 'sin_conformidad', 'validados'])
  .default('pendientes'),
```

> El `z.enum` se mantiene **estricto**: valores fuera del set son rechazados por Zod. La sanidad de FR-008 (valores inválidos → default) vive en el frontend (`normalizeState`), no aquí — ver C4.

## C3. `DocumentsFilters` — server (traducción SQL)

**Archivo**: `packages/server/src/domains/Documents/Infrastructure/Database/DocumentsFilters.ts`

La función `DocumentsFilters` recibe `filters: IGetDocumentsRepository['filters']` y produce `filterValidated`. Se refactoriza el operador ternario a un mapeo explícito de las 4 ramas, manteniendo byte-a-bit la salida de `'validados'` y `'pendientes'` (para no alterar `getStatisticsDocuments`).

**Propuesto** (esquema de `filterValidated`):

```ts
const filterValidated: WhereOptions<Documentos> = (() => {
  switch (filters.state) {
    case 'sin_conformidad':
      return {
        firmado: { [Op.not]: null },
        firma_bajo_acuerdo: { [Op.is]: false },
      } as WhereOptions<Documentos>;
    case 'bajo_conformidad':
      return {
        firmado: { [Op.not]: null },
        firma_bajo_acuerdo: { [Op.is]: true },
      } as WhereOptions<Documentos>;
    case 'validados':
      // ⚠️ IDÉNTICO al comportamiento actual — lo usa getStatisticsDocuments
      return {
        [Op.or]: [
          { firmado: { [Op.not]: null } },
          {
            [Op.and]: [
              { '$DocumentsTypesModel.requiere_firma$': false },
              { visualizado: { [Op.not]: null } },
            ],
          },
        ],
      } as WhereOptions<Documentos>;
    case 'pendientes':
      // ⚠️ IDÉNTICO al comportamiento actual — lo usa getStatisticsDocuments
      return {
        [Op.or]: [
          {
            [Op.and]: [
              { '$DocumentsTypesModel.requiere_firma$': true },
              { firmado: { [Op.is]: null } },
            ],
          },
          {
            [Op.and]: [
              { '$DocumentsTypesModel.requiere_firma$': false },
              { visualizado: { [Op.is]: null } },
            ],
          },
        ],
      } as WhereOptions<Documentos>;
    default:
      return {};
  }
})();
```

> **Nota**: `bajo_conformidad` y `sin_conformidad` NO dependen de `requiere_firma` — el estado de conformidad es derivado de `signed + agreedment`. `Op.is` se usa para booleans en vez de `==` literal (Sequelize lo requiere para valores booleanos; si el proyecto ya usa `{ [Op.eq]: true }`, mantener esa convención — checklist del implementador).

## C4. `TDocumentSearch` / `TStateDocument` frontend + normalización

**Archivo**: `packages/app/src/Domains/Documents/Document.entity.ts`

`TStateDocument` se importa de `@server/domains/Documents` (ya lo hace), por lo que el tipo se propaga automáticamente (Pr. III/VII). El `TDocumentSearch` no cambia su shape. Se agregan constantes y un helper de saneado:

```ts
import { TStateDocument } from '@server/domains/Documents';

export type TDocumentSearch = {
  state?: TStateDocument; // auto-actualizado por el import de @server
  title?: string;
  type?: string;
  id?: string;
  segmentos?: string;
};

export const PENDING: TStateDocument = 'pendientes';
export const VALIDATED: TStateDocument = 'validados'; // legacy
export const UNDER_CONFORMITY: TStateDocument = 'bajo_conformidad';
export const WITHOUT_CONFORMITY: TStateDocument = 'sin_conformidad';

// Opciones visibles en la UI (FR-001): exactamente 3.
export const DOCUMENT_STATES: TStateDocument[] = [
  PENDING,
  UNDER_CONFORMITY,
  WITHOUT_CONFORMITY,
];

const VALID_STATES: Set<string> = new Set([
  PENDING,
  VALIDATED,
  UNDER_CONFORMITY,
  WITHOUT_CONFORMITY,
]);

/** FR-008: normaliza un valor de `state` de la URL al set válido; inválido → PENDING. */
export const normalizeState = (value?: string | null): TStateDocument => {
  if (value && VALID_STATES.has(value)) return value as TStateDocument;
  return PENDING;
};
```

**Consumo** (`Hooks/useGetDocuments.ts`): normalizar antes de la query.

```ts
const { id, segmentos: rawSegmentos, state, ...rest } = searchParams || {};
const typedState = normalizeState(state);
```

## C5. `IGetDocuments.input.state` — sin cambios

`Application/documents.types.ts` y `Domain/Document.repository.ts` ya tipan `state?: TStateDocument`; el cambio del union propaga el contrato sin editar esos archivos.

## C6. Componente `DocumentsStateFilterField` — frontend

**Contrato del componente** (nuevo, dominio Documents):

```ts
// packages/app/src/Domains/Documents/Components/DocumentsStateFilterField/DocumentsStateFilterField.tsx
type DocumentsStateFilterFieldProps = {
  value: TStateDocument; // valor controlado desde el form (URL-normalizado)
  onChange: (value: TStateDocument) => void;
};
```

- Wrapper: `Container space="small"` + `Label` "Estado de conformidad" + `ToggleGroup type="single" variant="outline"`.
- Opciones: `DOCUMENT_STATES.map` con labels literales "Pendientes", "Firmados bajo conformidad", "Firmados sin conformidad".
- Activo con `buttonGroupActiveClass` (token `--primary`, sin teñir de verde/rojo).
- Sin `useHasPermission` (FR-002: visible para todos los roles).

## Contratos NO afectados

- `getStatisticsDocuments` → `IGetStatisticsDocumentsResponseRepository` (`total`/`pending`/`validated`) y método: sin cambios.
- `IGetDocuments` / `IGetDocumentsByCompany`: shape sin cambios (solo se amplía el domain del uniontype `state`).
- `ISignDocument` (firma con/sin conformidad): sin cambios — ya persiste `agreement` y `reasonSignatureNonConformity`.
