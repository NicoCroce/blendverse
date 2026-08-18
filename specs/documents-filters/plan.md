# Implementation Plan: Documents Filters — Estado de Conformidad

**Branch**: `002-documents-filters` | **Date**: 2026-08-03 | **Spec**: [`spec.md`](./spec.md)

**Input**: Feature specification from `/specs/documents-filters/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Reemplazar el filtro binario de estado (Pendientes/Validados) del formulario de documentos por un selector de **tres estados de conformidad** (Pendientes / Firmados bajo conformidad / Firmados sin conformidad), para empleados y admin por igual. El estado de conformidad es **derivado** de `signed` + `agreedment` (sin columnas nuevas); el valor legacy `state=validados` se conserva solo para compatibilidad de URLs sin opción de UI. El contrato (`TStateDocument`, `z.enum`, `DocumentsFilters`) se extiende de 2 a 4 valores (los 3 estados + `validados` legacy), manteniendo `getStatisticsDocuments` intacto.

## Technical Context

**Language/Version**: TypeScript 6.x estricto (monorepo pnpm); React 19 + Vite 8 (frontend); Node/Express 5 + tRPC v11 (backend)

**Primary Dependencies**:

- Server: Sequelize v6 (MySQL), Zod 4, Awilix 13, tRPC v11
- App: TanStack Query v5, React Router v7, Radix UI (`ToggleGroup`), Tailwind CSS v4

**Storage**: MySQL — **sin cambios de esquema** (estado derivado de `firmado`/`firma_bajo_acuerdo` existentes)

**Testing**: Vitest 2 (unit + integration) — unit de `DocumentsFilters`, contract del `z.enum`, component `DocumentsStateFilterField`, helper `normalizeState`

**Target Platform**: Web (SPA React + API tRPC monolith modular)

**Project Type**: Web application (monorepo: `packages/server` + `packages/app`)

**Performance Goals**: Sin degradación de la query de lista (mismas columnas indexadas; sin joins nuevos en los buckets de conformidad)

**Constraints**: `getStatisticsDocuments` NO se modifica; multi-tenant (`ownerId` del `RequestContext`) siempre; `agreedment = null` queda fuera de los buckets de firmados; docs sin firma requerida ya visualizados quedan fuera de los 3 buckets (consecuencia aceptada, spec Edge Cases)

**Scale/Scope**: Dominio `Documents` server + app; 2 endpoints de consulta (`getDocuments`, `getDocumentsByCompany`), 1 helper de filtros, 1 componente nuevo + form. Sin migraciones.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principio                       | Verificación requerida                                                                                                                                                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| I. Arquitectura Hexagonal / DDD | La feature modifica el dominio Documents: types en `Domain/`, filtros en `Infrastructure/Database`, contrato Zod en `Infrastructure/Controllers`, esquema en `Application/`. No toca barrels públicos (`index.ts`) ni `[domain].di.ts`                 |
| II. Multi-Tenant Obligatorio    | No se agregan parámetros nuevos de entrada; `ownerId` sigue viniendo de `RequestContext`. Los buckets nuevos NO agregan joins — el filtro por owner (`Usuario_id` / `id_propietario`) ya está en `getDocuments`/`getDocumentsByCompany`                |
| III. TypeScript Estricto + Zod  | `TStateDocument` sigue siendo un union type string usado por `z.enum` (patrón del dominio); el front importa tipos de `@server` y re-exporta constantes; sin `any`                                                                                     |
| IV. Flujo de Agentes Orquestado | Implementación por `@blendverse-implement` → back/front → tester → qa → reviewer según `tasks.md`                                                                                                                                                      |
| V. Tests por Regla de Negocio   | `@blendverse-tester` genera tests por bucket: unit de `DocumentsFilters` (4 estados + edge `agreedment=null`), contract del controller, component selector, US3 legacy                                                                                 |
| VI. Conventional Commits        | Scope `documents` para los commits de esta feature                                                                                                                                                                                                     |
| VII. Aislamiento de Dominios    | No se importan repos de otros dominios; el front importa `TStateDocument` de `@server/domains/Documents` (relación unidireccional permitida). El componente nuevo no usa `SegmentsFilterField` internamente: replica el patrón en el dominio Documents |

**Resultado GATE**: ✅ Pasa sin violaciones. No requiere Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/documents-filters/
├── plan.md              # Este archivo (/speckit.plan output)
├── research.md          # Phase 0 output (/speckit.plan)
├── data-model.md        # Phase 1 output (/speckit.plan)
├── quickstart.md        # Phase 1 output (/speckit.plan)
├── contracts/           # Phase 1 output (/speckit.plan)
└── tasks.md             # Phase 2 output (/speckit.tasks - NO creado por /speckit.plan)
```

### Source Code (repository root)

```text
packages/server/src/domains/Documents/
├── Domain/
│   └── Document.types.ts              # MODIFICAR: TStateDocument + 2 estados (bajo/sin conformidad)
├── Application/
│   └── documents.types.ts             # SIN cambios (IGetDocuments.input.state ya tipa TStateDocument)
├── Infrastructure/
│   ├── Controllers/
│   │   └── Documents.controller.ts    # MODIFICAR: z.enum de state con 4 valores
│   └── Database/
│       ├── DocumentsFilters.ts        # MODIFICAR: ramas bajo_conformidad / sin_conformidad (validados y pendientes intactos)
│       └── DocumentsRepository.implementation.ts  # SIN cambios (usa DocumentsFilters)
└── spec/                              # specs aislados del dominio (no creados por plan)

packages/app/src/Domains/Documents/
├── Document.entity.ts                 # MODIFICAR: constantes UNDER_CONFORMITY/WITHOUT_CONFORMITY + DOCUMENT_STATES + normalizeState
├── Components/
│   ├── DocumentsStateFilterField/
│   │   ├── DocumentsStateFilterField.tsx   # NUEVO: wrapper etiqueta + ToggleGroup 3 estados (patrón SegmentsFilterField)
│   │   ├── index.ts                        # NUEVO
│   │   └── specs/
│   │       └── DocumentsStateFilterField.spec.tsx  # NUEVO: tests component
│   └── FiltersDocumentsForm/
│       ├── FiltersDocumentsForm.tsx   # MODIFICAR: reemplaza ToggleGroup inline por DocumentsStateFilterField
│       └── specs/
│           └── FiltersDocumentsForm.spec.tsx  # MODIFICAR: asserts 3 opciones + estado por defecto
└── Hooks/
    └── useGetDocuments.ts             # MODIFICAR: normalizar state inválido antes de la query (FR-008)
```

**Structure Decision**: Se adopta la estructura existente del monolith DDD (server) y del módulo React por dominio (app). No hay estructura nueva: la feature agrega un componente + helper en carpetas ya existentes y modifica archivos puntuales del dominio Documents. Los specs aislados (pr. I) se generan con las reglas del proyecto en la fase de implementación si aplica.

## Complexity Tracking

> No aplica: el Constitution Check pasa sin violaciones justificadas.

## Decisiones de diseño (resumen)

| #   | Decisión              | Detalle                                                                                                                                                 |
| --- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Naming nuevos estados | `bajo_conformidad` / `sin_conformidad` (valores URL y de contrato) — ver research R4                                                                    |
| D2  | Legacy `validados`    | Se mantiene en el tipo, en el `z.enum` y en `DocumentsFilters` con semántica histórica; el frontend lo normaliza como válido pero NO lo ofrece en la UI |
| D3  | FR-008 (inválidos)    | Normalización en el frontend (`normalizeState` → default `pendientes`) ANTES de la query; el server conserva `z.enum` estricto                          |
| D4  | Estadísticas          | `getStatisticsDocuments` NO se modifica; las ramas `'validados'`/`'pendientes'` de `DocumentsFilters` quedan byte-a-bit idénticas                       |
| D5  | Componente            | `DocumentsStateFilterField` en dominio Documents, patrón wrapper etiqueta + selector (`SegmentsFilterField`), SIN gate de permisos (FR-002)             |
| D6  | Estado derivado       | Sin migración ni columnas: SQL sobre `firmado` + `firma_bajo_acuerdo`                                                                                   |

## Fases de implementación

### Fase A — Server (contrato + filtros)

1. `Domain/Document.types.ts`: `TStateDocument = 'validados' | 'pendientes' | 'bajo_conformidad' | 'sin_conformidad'`.
2. `Infrastructure/Controllers/Documents.controller.ts`: `state: z.enum(['pendientes', 'bajo_conformidad', 'sin_conformidad', 'validados']).default('pendientes')`.
3. `Infrastructure/Database/DocumentsFilters.ts`: refactor `filterValidated` a 4 ramas (switch o map de `WhereOptions`); `validados` y `pendientes` idénticas al comportamiento actual; agregar `bajo_conformidad` (`firmado IS NOT NULL AND firma_bajo_acuerdo = true`) y `sin_conformidad` (`firmado IS NOT NULL AND firma_bajo_acuerdo = false`).
4. Verificar que `getDocuments`, `getDocumentsByCompany` y `getStatisticsDocuments` compilan y pasan sin tocar el repository.

### Fase B — App (entidad + normalización)

1. `Document.entity.ts`: constantes `UNDER_CONFORMITY = 'bajo_conformidad'`, `WITHOUT_CONFORMITY = 'sin_conformidad'`; array `DOCUMENT_STATES` (los 3 de UI); helper `normalizeState(value): TStateDocument` que mapea cualquier valor no válido a `PENDING`.
2. `Hooks/useGetDocuments.ts`: aplicar `normalizeState` sobre `state` antes de enviar `...rest` (FR-008). Aplicar también en el hook del admin si `getDocumentsByCompany` se consume por separado (verificar `DocumentsListByUser`).

### Fase C — App (componente + form)

1. Crear `Components/DocumentsStateFilterField/`: wrapper `Label` + `ToggleGroup type="single"` con las 3 opciones (labels literales "Pendientes", "Firmados bajo conformidad", "Firmados sin conformidad"), `buttonGroupActiveClass` existente, `flex-wrap`, sin `useHasPermission`.
2. `FiltersDocumentsForm.tsx`: reemplazar el ToggleGroup inline por `<DocumentsStateFilterField />`; `initialState.state = PENDING`; `cleanFilters` vuelve a `PENDING`.
3. Ajustar specs existentes del form (3 opciones; empleado y admin ven el selector).

### Fase D — Tests (`@blendverse-tester`)

- Unit `DocumentsFilters`: cada estado contra fixtures concretos (pendiente, bajo, sin, legacy validados, `agreedment=null`, sin-firma-requerida-visualizado).
- Contract controller: `state` válido (4 valores) e inválido → error de validación.
- Component: 3 opciones, default, limpiar filtros, selección persiste en URL (US1/US2).
- Legacy: URL `?state=validados` resuelve sin error y sin opción de UI seleccionada incoherente (US3).
- Multi-tenant: fixture de otro owner NO aparece con ningún estado (Pr. II).

## Frontend Design Alignment (from `frontend-design.md`)

- **Tokens**: sin tokens nuevos. Activo = `--primary` naranja vía `buttonGroupActiveClass` (`data-[state=on]:!bg-primary`); contorno `--border` (ToggleGroup outline); helper opcional `text-xs text-muted-foreground`.
- **Tipografía**: `Label` estándar (`font-medium text-sm`) para "Estado de conformidad"; `text-sm` en opciones del ToggleGroup; sin fuentes nuevas.
- **Layout**: bloque vertical en `Container space="small"`, opciones en fila `justify-start gap-4 flex-wrap`; reemplaza al ToggleGroup actual sin tocar SheetFooter.
- **Elemento firma**: la rejilla de 3 estados, con "Bajo conformidad" como matiz nuevo — sin teñir buckets de color (sin juicio bueno/malo); el color de estado queda en el badge de la fila (fuera de esta feature).
- **Labels literales del dominio**: "Pendientes", "Firmados bajo conformidad", "Firmados sin conformidad" (display) ↔ valores URL `pendientes`/`bajo_conformidad`/`sin_conformidad`.

## Artifacts generados

- [`research.md`](./research.md) — Phase 0: resuelve R1–R8
- [`data-model.md`](./data-model.md) — Phase 1: estado derivado, sin cambio de columnas
- [`contracts/`](./contracts/) — Phase 1: TStateDocument, TDocumentSearch, z.enum, DocumentsFilters
- [`quickstart.md`](./quickstart.md) — Phase 1: guía de validación end-to-end
