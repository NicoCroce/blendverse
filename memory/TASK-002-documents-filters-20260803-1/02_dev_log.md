# 02_dev_log.md — Back_Agent

## Task

`TASK-002-documents-filters-20260803-1`

## Feature

`documents-filters` — Filtros por estado de conformidad en documentos (empleados y admin)

## Branch

`002-documents-filters`

## Attempts

2

## Agent

Back_Agent

## Fecha

2026-08-03

## Estado

IMPLEMENTED

## Cambios realizados (Fase A del plan, T002–T005)

### 1. `packages/server/src/domains/Documents/Domain/Document.types.ts` (T002)

- `TStateDocument` extendido de `'validados' | 'pendientes'` a 4 valores:
  `'pendientes' | 'bajo_conformidad' | 'sin_conformidad' | 'validados'`.
- `'validados'` anotado como legacy (reemplazado por bajo/sin conformidad, sin opción de UI).
- `Application/documents.types.ts` y `Domain/Document.repository.ts` NO fueron tocados (el union se propaga solo).

### 2. `packages/server/src/domains/Documents/Infrastructure/Controllers/Documents.controller.ts` (T003)

- El objeto `params` (compartido por `getDocuments` y `getDocumentsByCompany`) cambió:
  `state: z.enum(['pendientes', 'bajo_conformidad', 'sin_conformidad', 'validados']).default('pendientes')`.
- El `z.enum` sigue estricto (valores fuera del set → error Zod). FR-008 (normalización de inválidos) vive en el frontend.

### 3. `packages/server/src/domains/Documents/Infrastructure/Database/DocumentsFilters.ts` (T004)

- El ternario `filterValidated` se refactorizó a un mapa `filterState: Record<TStateDocument, WhereOptions<Documentos>>` con 4 ramas:
  - `validados`: byte-a-bit idéntica al comportamiento anterior (firmado OR sin firma requerida y visualizado).
  - `pendientes`: byte-a-bit idéntica al comportamiento anterior.
  - `bajo_conformidad`: `firmado: { [Op.not]: null }` AND `firma_bajo_acuerdo: { [Op.eq]: true }`.
  - `sin_conformidad`: `firmado: { [Op.not]: null }` AND `firma_bajo_acuerdo: { [Op.eq]: false }`.
- `filterValidated` se deriva de `filters.state ? filterState[filters.state] : {}`.
- Convención de booleanos: se usó `{ [Op.eq]: true/false }` (coherente con el estilo del repo, p. ej. `denominacion: { [Op.eq] }`); `Op.is` ya se usaba para nulls.

## NO modificados

- `DocumentsRepository.implementation.ts` (usa `DocumentsFilters`, sin cambios)
- `Application/documents.types.ts`
- `Domain/Document.repository.ts`
- `getStatisticsDocuments` (consume las ramas validados/pendientes idénticas)

## Validaciones

- `pnpm --filter @blendverse/server exec tsc --noEmit`: OK, 0 errores.
- `pnpm --filter @blendverse/server test`: specs de Documents 8/8 PASS (Document.entity.spec + SendDocumentToEmail.usecase.spec). Fallos en dominios ajenos (Users/Auth/Permissions/Themes/Ownersyss, "Token error"/password) confirmados como **preexistentes** vía stash test en baseline (1 fallo de Users ya existía sin estos cambios).

## Notas

- El orquestador ejecutó las validaciones y la verificación de baseline tras que el agente devolviera un resultado vacío; la implementación quedó correcta y los 3 archivos en disco.

---

# Sección Front_Agent — Implementación (T006–T010)

## Agent

Front_Agent

## Fecha

2026-08-03

## Estado

IMPLEMENTED

## Cambios realizados (Fases B y C del plan, T006–T010)

### 1. `packages/app/src/Domains/Documents/Document.entity.ts` (T006)

- Agregados `UNDER_CONFORMITY = 'bajo_conformidad'` y `WITHOUT_CONFORMITY = 'sin_conformidad'`; `PENDING` y `VALIDATED` conservados.
- Constantes tipadas como literales (`as const`) para preservar el literal en computed keys y `normalizeState`.
- `DOCUMENT_STATES` con **exactamente 3** elementos de UI (PENDING, UNDER_CONFORMITY, WITHOUT_CONFORMITY — sin `validados`), declarado `as const satisfies readonly TStateDocument[]`.
- `VALID_STATES: Set<TStateDocument>` con los **4** valores (incluye `VALIDATED` legacy).
- `normalizeState(value?: string | null): TStateDocument`: cualquier valor fuera de `VALID_STATES` → `PENDING` (FR-008). `'validados'` → `'validados'` (FR-007), `undefined` → `'pendientes'`.

### 2. `packages/app/src/Domains/Documents/Components/DocumentsStateFilterField/` (T007, NUEVO)

- `DocumentsStateFilterField.tsx`: wrapper `Container space="small"` + `Label` "Estado de conformidad" + `ToggleGroup type="single" variant="outline"` con `justify-start gap-4 flex-wrap`; props controladas `{ value: TStateDocument; onChange }`.
- Opciones mapeadas de `DOCUMENT_STATES` con labels literales del dominio "Pendientes", "Firmados bajo conformidad", "Firmados sin conformidad" (frontend-design §5) y `buttonGroupActiveClass` (`data-[state=on]:!bg-primary data-[state=on]:!text-secondary`).
- SIN `useHasPermission` ni gate de `DASHBOARD_ACCESS` (FR-002); sin tokens de color nuevos (frontend-design §2); activo = `--primary` naranja existente.
- `index.ts` barrel del folder.

### 3. `packages/app/src/Domains/Documents/Components/FiltersDocumentsForm/FiltersDocumentsForm.tsx` (T008)

- El bloque inline de `ToggleGroup`/`ToggleGroupItem` de estado se reemplazó por `<DocumentsStateFilterField value={formState.state ?? PENDING} onChange={...} />`.
- `initialState.state = PENDING` (default); `cleanFilters` resetea a `initialState` → vuelve a PENDING (FR-009).
- Eliminados código muerto: `VALIDATED`, `TStateDocument`, `ToggleGroup`, `ToggleGroupItem`, `handleState` y `buttonGroupActiveClass` locales.
- `SegmentsFilterField` y el resto (nombre, SheetFooter) intactos.

### 4. `packages/app/src/Domains/Documents/Hooks/useGetDocuments.ts` (T009)

- `normalizeState` aplicado sobre `state` antes de la query: `const { id, segmentos: rawSegmentos, state, ...rest }` y se envía `state: normalizeState(state)` (además de `...rest` y `segmentos`). `state=zzz` nunca llega al server; `state=validados` llega como `validados` (US3).

### 5. `packages/app/src/Domains/Admin/Hooks/useGetDocumentsByCompany.ts` (T010)

- Misma normalización que T009 sobre `getAllByCompany` (FR-010). `normalizeState` importado desde `@app/Domains/Documents`.

### 6. `packages/app/src/Domains/Documents/Components/FiltersDocumentsForm/specs/FiltersDocumentsForm.spec.tsx` (ajuste de spec existente)

- El spec YA fallaba en baseline (2 fallos: `getByText('Tipo')` apuntaba a un bloque comentado). Se ajustaron aserciones obsoletas y se agregó cobertura mínima pedida: label "Estado de conformidad", 3 opciones (radios del ToggleGroup), ausencia de "Validados" y default "Pendientes" (`data-state="on"`). Sin tests nuevos (los genera el Tester).

## Decisiones Técnicas

- **[normalizeState siempre enviado]:** los hooks envían `state: normalizeState(state)` incluso cuando no hay `state` en la URL; como el `z.enum` del controller tiene `.default('pendientes')`, enviar `'pendientes'` explícito es semánticamente idéntico al default del server. Garantiza FR-008 sin cambiar el contrato.
- **[Constantes como literales `as const`]:** `PENDING`/`UNDER_CONFORMITY`/etc. se tiparon como literales (no `TStateDocument`) para que funcionen como computed keys en `DOCUMENT_STATE_LABELS` y para que `(typeof DOCUMENT_STATES)[number]` sea el union de 3 literales. Siguen siendo asignables a `TStateDocument`.
- **[`DOCUMENT_STATES` con `satisfies readonly TStateDocument[]`]:** preserva la tupla literal de exactamente 3 elementos en el tipo sin perder la compatibilidad con `TStateDocument[]`.
- **[Dist del server regenerado]:** el server es `composite` y la app resuelve tipos contra `dist/**/*.d.ts` vía project reference; el `dist` estaba stale con `TStateDocument = 'validados' | 'pendientes'`. Se ejecutó `pnpm --filter @blendverse/server build` (solo artefacto ignorado por git, sin tocar source del server) para refrescar los `.d.ts`.
- **[ToggleGroup → role="radio"]:** Radix `ToggleGroup type="single"` renderiza los items con `role="radio"`, no `button`; las aserciones del spec usan `getByRole('radio')`.
- **[Aislamiento de scope]:** no se tocó `Components/index.ts` ni el barrel público de Documents (T014 exige diff acotado); el componente se importa por ruta relativa desde el form y queda exportado por su propio barrel de folder.

## Deuda Técnica Conocida

- El spec de `FiltersDocumentsForm` seguía fallando en baseline por una aserción de un campo "Tipo" comentado (pre-existente); quedó corregido al ajustar el spec. Sin otra deuda registrada.
