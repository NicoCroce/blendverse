---
task_id: 'TASK-feat-segments-filter-access-20260803-1'
agent: 'Reviewer_Agent'
status: 'APPROVED'
attempts: 1
date: '2026-08-03'
---

# Revisión de Estándares — Segments Filter Access

Feature front-only que oculta el bloque "Segmentos" (etiqueta + selector) del filtro de Documentos y Certificados para usuarios sin `DASHBOARD_ACCESS`, conservándolo para admins y sin alterar el parámetro de URL `segmentos`.

## Resultado: ✅ APPROVED

Verificaciones fuera del checklist que confirman los criterios específicos de la feature:

- **Opción (b) de la spec implementada**: `SegmentsFilterField` vive en el dominio Segments (`Components/`), encapsula etiqueta + `<SegmentsFilter />` + chequeo de permiso; los formularios padres (`FiltersDocumentsForm`, `FiltersCertificatesForm`) no conocen la regla de visibilidad. Bloque atómico (imposible mostrar la etiqueta sin el selector).
- **Seguridad (patrón `MenuAccess`)**: `SegmentsFilterField` usa `const { hasPermission } = useHasPermission(); if (!hasPermission(DASHBOARD_ACCESS)) return null;` — idéntico a `Domains/MenuAccess.tsx` (líneas 16-17). `useHasPermission` devuelve `false` en carga (`data?.includes(permission) ?? false`) → el wrapper retorna `null`, cumpliendo FR-008 (sin flash). No se debilita ningún permiso.
- **FR-005/FR-006 garantizados**: `SegmentsFilter.tsx`, `useURLParams`, `updateParams` y `cleanFilters` **no fueron tocados** (no aparecen en `git diff`); el diff de los forms solo reemplaza el bloque por `<SegmentsFilterField />` y swapea el import. El parámetro `segmentos` sigue viviendo exclusivamente en `SegmentsFilter`.
- **Tipado TS**: 0 `any` en los 9 archivos afectados; la única prop nueva es `showLabel?: boolean` tipada inline.
- **Constitución Pr. I-VII**: I (DDD frontend, estructura `Components/` + barrel respetada) ✅ · II (N/A, sin queries) ✅ · III (sin `any`, sin tipos manuales) ✅ · IV (flujo orquestado con artefactos en `memory/`) ✅ · V (T1-T11 definidos y verdes, QA 88/88) ✅ · VI (pendiente commit; nota en Deuda Técnica) · VII (wrapper importa solo `@app/Application` transversal + `./SegmentsFilter` del propio dominio) ✅.

---

## Checklist

| #   | Criterio                                | Nivel | Estado | Detalle                                                                                                                                     |
| --- | --------------------------------------- | ----- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Domain no importa Infrastructure        | 🔴    | ✅     | N/A backend; front-only. `SegmentsFilterField` importa solo `@app/Application` (transversal) + `./SegmentsFilter` (mismo dominio) — Pr. VII |
| 2   | Use Cases usan interfaz abstracta       | 🔴    | ✅     | N/A — sin use cases afectados (frontend puro)                                                                                               |
| 3   | Archivos globales actualizados          | 🔴    | ✅     | `Segments/Components/index.ts` agrega `export * from './SegmentsFilterField';`                                                              |
| 4   | Sin `any` explícito                     | 🔴    | ✅     | 0 matches en los 9 archivos afectados                                                                                                       |
| 5   | Tipos de retorno explícitos             | 🟡    | ✅     | Props tipadas inline (`SegmentsFilterFieldProps`); componentes React                                                                        |
| 6   | Solo interfaces compartidas entre capas | 🔴    | ✅     | Única prop `showLabel?: boolean` inline; sin clases concretas entre capas                                                                   |
| 7   | Zod en controller/formulario            | 🔴    | ✅     | N/A — no se agregan inputs nuevos ni cambios de validación (front-only)                                                                     |
| 8   | Filtro `ownerId` en queries             | 🔴    | ✅     | N/A — sin queries de repositorio en la feature                                                                                              |
| 9   | Sin `console.log` en producción         | 🟡    | ✅     | 0 matches en archivos afectados                                                                                                             |
| 10  | Convenciones de nomenclatura            | 🔴    | ✅     | `SegmentsFilterField.tsx` PascalCase en `Components/`; specs `*.spec.tsx` en `specs/`; props camelCase — alineado con `app.instructions.md` |
| 11  | Entidad con `static create()` etc.      | 🟡    | ✅     | N/A — sin entidad afectada (frontend)                                                                                                       |
| 12  | Barrels exportan correctamente          | 🟡    | ✅     | `Components/index.ts` y `Segments/index.ts` (barrel puro: Application + Components + Domain) correctos                                      |

---

## Deuda Técnica (solo si hay algo concreto)

- **Pr. VI (Conventional Commits)**: los cambios están en working tree, aún no commiteados. Al commitear, usar scope del dominio (`feat(segments): ...`) y sin atribución IA, según `commit-conventions`.
- **Import de `Label` desde `@app/Application/Components/ui/label`** (raw shadcn): consistente con el código pre-existente (`SegmentsFilter.tsx` y ambos forms usan el mismo path), por lo que no es desvío de esta feature; candidato a unificación futura si el proyecto migra a wrappers de proyecto.
