# Implementation Plan: Segments Filter Access

**Branch**: `feat/segments-filter-access` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/segments-filter-access/spec.md`

**Nota**: este plan se genera por `/speckit.plan` en modo revisión; NO genera `tasks.md` (queda para `/speckit.tasks` posterior a la aprobación). `data-model.md`, `contracts/` y `quickstart.md` no se generan: la feature es frontend puro sin cambios de modelo ni interfaces externas (ver justificación en Estructura de Archivos).

## Summary

Ocultar el bloque "Segmentos" (etiqueta + selector) del filtro de documentos y certificados para usuarios sin el permiso `DASHBOARD_ACCESS`, manteniéndolo intacto para admins y sin alterar el procesamiento del parámetro de URL `segmentos`.

**Enfoque técnico (opción b de la spec)**: crear un componente envolvente reutilizable `SegmentsFilterField` dentro del dominio Segments que encapsule etiqueta "Segmentos" + `<SegmentsFilter />` + el chequeo `useHasPermission(DASHBOARD_ACCESS)`. Los formularios padres reemplazan su bloque actual por `<SegmentsFilterField />`; la regla de visibilidad vive en un único lugar y el bloque es atómico (imposible mostrar la etiqueta sin el selector).

**Decisiones de diseño clave**:

1. **Seguridad por defecto en carga (FR-008)**: `useHasPermission` devuelve `false` mientras `data === undefined` (`data?.includes(perm) ?? false`); el wrapper retorna `null` en ese estado. Nunca se muestra un control que luego deba ocultarse. El riesgo de flash para admins es mínimo porque `useGetPermissions` tiene `staleTime: 60s` y los permisos ya se consultaron al boot (MenuAccess).
2. **`showLabel?: boolean` (default `true`)**: la toolbar de "Segmentos por usuario" (US4/FR-009) usa `<SegmentsFilterField showLabel={false} />` — aplica la misma regla de visibilidad sin introducir la etiqueta que hoy no existe en esa pantalla (cero cambios visuales para el admin, defensa en profundidad si la protección de ruta cambiara).
3. **FR-005/FR-006 garantizados por diseño**: `SegmentsFilter` (selector) es quien escribe/lee `segmentos` en la URL y no se toca; los forms solo actualizan sus propios campos (`updateParams` mergea sobre el URLSearchParams existente, nunca borra `segmentos`). Ocultar el wrapper desmonta el selector, por lo que no puede escribir en la URL, y el parámetro permanece al limpiar/aplicar otros filtros.

## Technical Context

**Language/Version**: TypeScript 6.x estricto, React 19, Vite 8, Vitest 2

**Primary Dependencies**: TanStack Query v5, React Router v7 (`useSearchParams`/`useNavigate` vía `useURLParams`), tRPC v11 (client), Radix UI (Popover/Command/Checkbox), Tailwind CSS v4, Testing Library + jsdom

**Storage**: N/A (sin backend, sin modelo)

**Testing**: Vitest 2 + `@testing-library/react` + jsdom; setup en `packages/app/src/test/setup.ts`; convención de specs colocalizadas en carpetas `specs/` por capa (`*.spec.tsx`)

**Target Platform**: Web (browser), `packages/app`

**Project Type**: Monorepo pnpm — frontend React (Vite) en `packages/app`, backend Express/tRPC en `packages/server`

**Performance Goals**: N/A (sin operaciones nuevas; el cambio es render condicional)

**Constraints**: Sin regresiones visuales para admins (US2/US4); sin cambios en el backend ni en el modelo de permisos; no introducir `any` ni tipos manuales nuevos (Pr. III)

**Scale/Scope**: 1 componente nuevo + 1 barrel modificado + 3 consumidores modificados + specs de componente

## Constitution Check

_GATE: evaluado antes de Phase 0; se re-evalúa tras Phase 1. Sin violaciones._

| Principio                       | Verificación                                                                                                                                                                                                         | Resultado |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| I. Arquitectura Hexagonal / DDD | Feature 100% frontend: agrega `SegmentsFilterField` al dominio Segments siguiendo la estructura existente (`Components/` + barrel). No crea ni modifica dominios del server.                                         | PASS      |
| II. Multi-Tenant Obligatorio    | N/A — no hay queries a repositorios ni backend.                                                                                                                                                                      | PASS      |
| III. TypeScript Estricto + Zod  | Componente sin `any`; no se definen tipos manuales nuevos (la única prop `showLabel?: boolean` se tipa inline). `useHasPermission`/`DASHBOARD_ACCESS` ya tipados.                                                    | PASS      |
| IV. Flujo de Agentes Orquestado | La implementación pasará por `@blendverse-implement` → `@blendverse-front` → `@blendverse-tester` → `@blendverse-qa` → `@blendverse-reviewer`, con registro en `memory/history_log.json`.                            | PASS      |
| V. Tests por Regla de Negocio   | La regla de visibilidad es lógica de negocio real → `@blendverse-tester` genera specs concretos del wrapper y de los forms (ver Fases 1-3).                                                                          | PASS      |
| VI. Conventional Commits        | Commits con scope `segments` (dominio afectado), p. ej. `feat(segments): ocultar bloque de filtro sin DASHBOARD_ACCESS`; sin atribución IA.                                                                          | PASS      |
| VII. Aislamiento de Dominios    | `SegmentsFilterField` importa solo `@app/Application` (transversal global: `useHasPermission`, `DASHBOARD_ACCESS`, `Container`) y de su propio dominio (`./SegmentsFilter`). Sin imports de repos de otros dominios. | PASS      |

## Project Structure

### Documentation (this feature)

```text
specs/segments-filter-access/
├── spec.md              # Especificación (input)
├── plan.md              # Este archivo (/speckit.plan — modo revisión)
└── tasks.md             # /speckit.tasks — NO generado en este comando
```

**No generados (justificación)**:

- `research.md`: no hay NEEDS CLARIFICATION — la spec ya decidió el enfoque (opción b) y el contexto técnico es conocido (patrón `useHasPermission`/`DASHBOARD_ACCESS` ya en uso en `MenuAccess`). La decisión y las alternativas evaluadas quedan documentadas en este plan.
- `data-model.md`: N/A — no hay entidades, campos ni transiciones de estado; la feature no toca el modelo.
- `contracts/`: N/A — no hay interfaces externas nuevas (API, CLI, endpoints); el contrato del componente es su firma de props, documentada en Fase 1.
- `quickstart.md`: N/A como archivo separado — los escenarios de validación manual se incluyen en la sección Validación de este plan (modo revisión).
- Actualización de AGENTS.md (`agent-context`): N/A — no existe `AGENTS.md` en la raíz del repo (el config apunta a él pero el archivo no está presente).

### Source Code (packages/app)

```text
packages/app/src/Domains/Segments/
├── Components/
│   ├── SegmentsFilter.tsx            # EXISTENTE — sin cambios (selector puro)
│   ├── SegmentsFilterField.tsx       # NUEVO — wrapper con label + permiso
│   ├── index.ts                      # MODIFICADO — export del nuevo componente
│   ├── UserSegments/
│   │   └── UserSegmentsToolbar.tsx   # MODIFICADO — usa SegmentsFilterField showLabel={false}
│   └── specs/
│       └── SegmentsFilterField.spec.tsx   # NUEVO — tests del wrapper
├── (barrel del dominio index.ts exporta Components — sin cambios)

packages/app/src/Domains/Documents/Components/FiltersDocumentsForm/
├── FiltersDocumentsForm.tsx          # MODIFICADO — reemplaza bloque por SegmentsFilterField
└── specs/
    └── FiltersDocumentsForm.spec.tsx # NUEVO — tests de visibilidad del form

packages/app/src/Domains/Certificates/Components/
├── FiltersCertificatesForm.tsx       # MODIFICADO — reemplaza bloque por SegmentsFilterField
└── specs/
    └── FiltersCertificatesForm.spec.tsx  # NUEVO — tests de visibilidad del form
```

**Estructura del bloque visual (sin cambios de layout)**:

| Antes (en cada form)                                                              | Después (encapsulado en el wrapper)                                                                |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `<Container space="small"><Label>Segmentos</Label><SegmentsFilter /></Container>` | `<SegmentsFilterField />` → mismo Container + Label + selector (admin) / `null` (empleado o carga) |

## Fases de Implementación

> Orden pensado para mantener el repo compilable en cada fase: F1 crea el componente + tests; F2 y F3 consumen el componente; F4 verifica integración. Cada fase termina con tests verdes (`pnpm --filter app test`) y sin errores de `tsc` (`pnpm --filter app tsc`) ni ESLint (`pnpm --filter app lint`).

### Fase 1 — Componente `SegmentsFilterField` en el dominio Segments

**Archivos**:

- NUEVO `packages/app/src/Domains/Segments/Components/SegmentsFilterField.tsx`
- MODIFICADO `packages/app/src/Domains/Segments/Components/index.ts` (agregar `export * from './SegmentsFilterField';`)
- NUEVO `packages/app/src/Domains/Segments/Components/specs/SegmentsFilterField.spec.tsx`

**Contrato del componente**:

```ts
type SegmentsFilterFieldProps = { showLabel?: boolean }; // default: true
```

- Importa `useHasPermission`, `DASHBOARD_ACCESS`, `Container` desde `@app/Application`; `Label` desde `@app/Application/Components/ui/label`; `SegmentsFilter` relativo `./SegmentsFilter`.
- Lógica: `const { hasPermission } = useHasPermission(); if (!hasPermission(DASHBOARD_ACCESS)) return null;` — cubre empleado (false) Y carga de permisos (data undefined → false), cumpliendo FR-008.
- Con `showLabel` (default): retorna `<Container space="small"><Label>Segmentos</Label><SegmentsFilter /></Container>` — idéntico al layout actual de los forms.
- Con `showLabel={false}`: retorna solo `<SegmentsFilter />` (sin etiqueta), para la toolbar (US4).
- **Sin lógica de URL**: no toca `segmentos`; la escritura/lectura del parámetro sigue viviendo exclusivamente en `SegmentsFilter`.

**Tests esperados (Fase 1)** — `SegmentsFilterField.spec.tsx`, mockeando `useHasPermission` (y `./SegmentsFilter` como stub para aislar la regla):

| #   | Caso                                                       | Assert                                                                                |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| T1  | Usuario con `DASHBOARD_ACCESS` (admin)                     | Renderiza etiqueta "Segmentos" + selector                                             |
| T2  | Usuario sin `DASHBOARD_ACCESS` (empleado)                  | Retorna `null` — ni etiqueta ni selector en el DOM (US1, FR-001/002, FR-003 negativo) |
| T3  | Permisos en carga (data undefined → `hasPermission` false) | Retorna `null` — sin flash (FR-008)                                                   |
| T4  | `showLabel={false}` con permiso                            | Renderiza selector sin etiqueta "Segmentos" (FR-009)                                  |
| T5  | `showLabel={false}` sin permiso                            | Retorna `null` (defensa en profundidad)                                               |

### Fase 2 — Aplicación en los formularios de Documentos y Certificados

**Archivos**:

- MODIFICADO `packages/app/src/Domains/Documents/Components/FiltersDocumentsForm/FiltersDocumentsForm.tsx` (líneas 110-113): reemplazar `<Container space="small"><Label>Segmentos</Label><SegmentsFilter /></Container>` por `<SegmentsFilterField />`; swap del import `{ SegmentsFilter }` → `{ SegmentsFilterField }` desde `@app/Domains/Segments`.
- MODIFICADO `packages/app/src/Domains/Certificates/Components/FiltersCertificatesForm.tsx` (líneas 207-210): ídem.
- NUEVOS specs de ambos forms (carpeta `specs/` junto a cada componente).

**Tests esperados (Fase 2)** — mockear `useGetDocumentsTypes`/`useGetCertificatesTypes` y `useHasPermission`; render con `QueryClientProvider` + `MemoryRouter`:

| #   | Caso                         | Assert                                                                                 |
| --- | ---------------------------- | -------------------------------------------------------------------------------------- |
| T6  | Documents form + admin       | Se ve "Segmentos" + resto de campos (nombre/estado/tipo) (FR-003/007)                  |
| T7  | Documents form + empleado    | NO se ve "Segmentos"; resto de campos intactos y sin huecos de layout (US1 FR-001/007) |
| T8  | Certificates form + admin    | Se ve "Segmentos" + resto de campos (tipo/fecha/año/estado) (FR-003/007)               |
| T9  | Certificates form + empleado | NO se ve "Segmentos"; resto de campos intactos (US1 FR-002/007)                        |

### Fase 3 — Consistencia en `UserSegmentsToolbar` (US4 / FR-009)

**Archivos**:

- MODIFICADO `packages/app/src/Domains/Segments/Components/UserSegments/UserSegmentsToolbar.tsx` (líneas 52-54): `<SegmentsFilter />` → `<SegmentsFilterField showLabel={false} />`; swap del import relativo `../SegmentsFilter` → `../SegmentsFilterField`. El `div.w-full sm:w-64` externo se mantiene (layout intacto).
- NUEVO `packages/app/src/Domains/Segments/Components/UserSegments/specs/UserSegmentsToolbar.spec.tsx`

**Tests esperados (Fase 3)**:

| #   | Caso               | Assert                                                                                                     |
| --- | ------------------ | ---------------------------------------------------------------------------------------------------------- |
| T10 | Toolbar + admin    | Selector de segmentos visible, SIN etiqueta "Segmentos" (igual que hoy — US4 escenario 1)                  |
| T11 | Toolbar + empleado | Selector ausente (defensa en profundidad; en producción el empleado no accede a la ruta — US4 escenario 2) |

### Fase 4 — Verificación integral y cierre

- Ejecutar `pnpm --filter app tsc`, `pnpm --filter app test` y `pnpm --filter app lint` (o `pnpm lint` desde raíz). 0 errores, 0 tests fallidos.
- Smoke manual según escenarios de Validación (abajo) para US1-US4.
- El pipeline continúa con `@blendverse-tester` (tests por regla de negocio), `@blendverse-qa` y `@blendverse-reviewer` según la constitución Pr. IV/V. `tasks.md` se genera con `/speckit.tasks` tras aprobación de este plan.

## Cobertura de User Stories y Requisitos

| Ítem                                     | Cómo se cubre                                                                                                                                                                      | Dónde                                      |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| US1 (empleado no ve bloque)              | Wrapper retorna `null` sin permiso; ambos forms lo consumen                                                                                                                        | F1-T2, F2-T7/T9                            |
| US2 (admin conserva bloque)              | Wrapper renderiza etiqueta + selector con permiso, layout idéntico                                                                                                                 | F1-T1, F2-T6/T8                            |
| US3 (`segmentos` en URL sigue filtrando) | Garantía de diseño: `SegmentsFilter` (quien lee/escribe `segmentos`) no se toca; el ocultamiento solo desmonta el control                                                          | Fase 4 smoke manual (escenario compartido) |
| US4 (toolbar consistente)                | `showLabel={false}` aplica la misma regla sin cambios visuales; ruta admin-only protegida sigue igual                                                                              | F1-T4/T5, F3-T10/T11                       |
| FR-001/002                               | No mostrar bloque en Documents/Certificates sin permiso                                                                                                                            | F1-T2, F2-T7/T9                            |
| FR-003                                   | Mostrar bloque completo para admin en ambos forms                                                                                                                                  | F1-T1, F2-T6/T8                            |
| FR-004                                   | Visibilidad derivada de permisos (única fuente: wrapper con `useHasPermission`)                                                                                                    | F1 (diseño) + T1/T2                        |
| FR-005                                   | Parámetro `segmentos` sigue filtrando a nivel consulta: código de URL intacto                                                                                                      | Fase 4 smoke manual (US3)                  |
| FR-006                                   | Al aplicar/limpiar otros filtros no se borra `segmentos`: `updateParams` de los forms solo toca sus campos (merge sobre URLSearchParams); `cleanFilters` no llama a `updateParams` | Garantía de diseño + smoke manual          |
| FR-007                                   | Resto de controles intactos: los forms solo cambian el bloque de segmentos                                                                                                         | F2-T6..T9, regresión suite                 |
| FR-008                                   | No flash durante carga: `hasPermission` false con data undefined → `null`                                                                                                          | F1-T3                                      |
| FR-009                                   | Toolbar conserva el filtro para admin; efecto nulo para empleados (ruta protegida)                                                                                                 | F1-T4/T5, F3-T10/T11                       |
| SC-001                                   | Empleados sin permiso no ven el bloque en Documentos ni Certificados (verificado por inspección visual/DOM)                                                                        | F2-T7/T9 + smoke manual (US1)              |
| SC-002                                   | Admins ven el bloque completo y funcional en ambos formularios, sin cambios respecto del comportamiento previo                                                                     | F1-T1, F2-T6/T8 + smoke manual (US2)       |
| SC-003                                   | URL con `segmentos` filtra resultados aunque el control esté oculto                                                                                                                | Fase 4 smoke manual (T013, US3)            |
| SC-004                                   | `segmentos` permanece en la URL al aplicar o limpiar otros filtros                                                                                                                 | Garantía de diseño + smoke manual (T013)   |
| SC-005                                   | 0 regresiones funcionales en los demás controles de ambos formularios, para ambos perfiles                                                                                         | F2-T6..T9 + suite de regresión             |

## Validación (manual, para QA/review — reemplaza quickstart.md)

**Prerrequisitos**: `pnpm install` y base local levantada; `pnpm app:dev`.

| Escenario | Pasos                                                                                       | Resultado esperado                                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US1       | Login como empleado (sin `DASHBOARD_ACCESS`); abrir filtros de Documentos y de Certificados | Bloque "Segmentos" ausente en ambos; resto de campos normales; sin huecos ni errores de layout                                                          |
| US2       | Login como admin; abrir ambos formularios                                                   | Bloque "Segmentos" con label + selector en estado por defecto ("Filtrar por segmentos"); seleccionar segmentos actualiza URL con `segmentos`            |
| US3       | Login como empleado; navegar a Documentos con `?segmentos=1,2` en la URL                    | Resultados filtrados por segmentos; el parámetro permanece al aplicar/limpiar otros filtros (sin control visible para quitarlo — consecuencia aceptada) |
| US4       | Login como admin; entrar a "Segmentos por usuario"                                          | Filtro de segmentos en la toolbar sin etiqueta, como antes; empleado no accede a la ruta                                                                |
| FR-008    | Con red lenta (throttle en DevTools), entrar como empleado a un form                        | El bloque nunca aparece ni parpadea durante la carga de permisos                                                                                        |
| Regresión | Admin y empleado: probar nombre/estado/tipo (Docs) y tipo/fecha/año/estado (Certs)          | Comportamiento idéntico al actual                                                                                                                       |

## Complexity Tracking

Sin violaciones a la constitución — tabla no aplica. No se introducen dependencias nuevas ni patrones que contradigan las reglas del proyecto.
