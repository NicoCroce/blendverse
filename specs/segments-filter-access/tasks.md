# Tasks: Segments Filter Access

**Input**: Design documents from `/specs/segments-filter-access/` — `spec.md` (user stories + FR/SC) y `plan.md` (fases F1–F4, tests T1–T11).

**Prerequisites**: plan.md (required), spec.md (required para user stories). No hay `data-model.md` ni `contracts/`: la feature es frontend puro, sin cambios de modelo ni interfaces externas (justificado en plan.md).

**Tests**: La Constitución Pr. V establece que los tests los genera y ejecuta `@blendverse-tester` DESPUÉS de la implementación. Los casos T1–T11 del plan se planifican aquí como tareas de spec (contrato exacto de casos para el tester); la ejecución sigue el pipeline `@blendverse-front` → `@blendverse-tester` → `@blendverse-qa` → `@blendverse-reviewer` (Pr. IV).

**Organización**: Fases alineadas al orden del plan (F1→F4) para garantizar repo compilable en cada paso, mapeadas a user stories con labels [USn]. US1 y US2 (P1) son atómicas: las implementa el mismo cambio (el wrapper en ambos forms) y las cubren los mismos tests T6–T9 → label combinado `[US1|US2]`.

## Formato: `[ID] [P?] [Story] Descripción`

- **[P]**: puede correr en paralelo (archivos distintos, sin dependencias)
- **[Story]**: user story que sirve (US1, US2, US3, US4; `[US1|US2]` = cambio atómico que cubre ambas)
- Setup / Foundational / Verificación: SIN label de story
- Paths absolutos relativos a la raíz del repo; alias `@app` → `packages/app/src`

## Comandos de verificación (por fase y por tarea)

| Comando                            | Propósito                      |
| ---------------------------------- | ------------------------------ |
| `pnpm --filter app tsc`            | TypeScript estricto, 0 errores |
| `pnpm --filter app test`           | Vitest run, 0 fallos           |
| `pnpm --filter app lint`           | ESLint, 0 errores              |
| `pnpm --filter app test -- <path>` | Correr un spec puntual         |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verificar línea base del repo ANTES de tocar código. No hay dependencias nuevas ni inicialización de proyecto (monorepo existente, plan.md §Stack).

- [ ] T001 Verificar línea base compilable: `pnpm --filter app tsc` + `pnpm --filter app test` + `pnpm --filter app lint` en el checkout limpio (sin cambios de la feature)

**Archivos**: ninguno (solo ejecución)
**Aceptación**: los 3 comandos pasan en verde antes de empezar (baseline conocido: 0 errores, 0 tests fallidos).
**Verificar**: `pnpm --filter app tsc && pnpm --filter app test && pnpm --filter app lint`

---

## Phase 2: Foundational (Blocking Prerequisites) — F1 del plan: componente `SegmentsFilterField`

**Purpose**: Componente envolvente atómico que encapsula la regla de visibilidad (etiqueta "Segmentos" + selector + chequeo `useHasPermission(DASHBOARD_ACCESS)`) en UN solo lugar (opción b de la spec; FR-004). BLOQUEA US1, US2 y US4: todos los consumidores dependen de este componente.

**⚠️ CRITICAL**: ningún trabajo de user story comienza hasta completar esta fase.

- [ ] T002 Crear componente `SegmentsFilterField` en `packages/app/src/Domains/Segments/Components/SegmentsFilterField.tsx`

**Archivos**: `packages/app/src/Domains/Segments/Components/SegmentsFilterField.tsx` (NUEVO)
**Contrato**: `type SegmentsFilterFieldProps = { showLabel?: boolean }` (default `true`). Imports: `useHasPermission`, `DASHBOARD_ACCESS`, `Container` desde `@app/Application`; `Label` desde `@app/Application/Components/ui/label`; `SegmentsFilter` relativo `./SegmentsFilter`. Lógica: `const { hasPermission } = useHasPermission(); if (!hasPermission(DASHBOARD_ACCESS)) return null;`. Con `showLabel` (default): `<Container space="small"><Label>Segmentos</Label><SegmentsFilter /></Container>` (layout idéntico al actual de los forms). Con `showLabel={false}`: `<SegmentsFilter />` solo (sin etiqueta). Sin lógica de URL: la lectura/escritura de `segmentos` sigue viviendo exclusivamente en `SegmentsFilter` (FR-005/FR-006 por diseño).
**Aceptación**: FR-004 (visibilidad derivada solo de permisos), FR-008 (durante carga `data === undefined` → `hasPermission` false → `null`, sin flash), US1/US2 (bloque atómico: imposible etiqueta sin selector), US4 (prop `showLabel`).
**Verificar**: `pnpm --filter app tsc` (compila sin `any` ni tipos manuales nuevos — Pr. III); comportamiento cubierto por T004.

- [ ] T003 [P] Agregar `export * from './SegmentsFilterField';` al barrel `packages/app/src/Domains/Segments/Components/index.ts`

**Archivos**: `packages/app/src/Domains/Segments/Components/index.ts` (MODIFICADO)
**Aceptación**: `@app/Domains/Segments` expone `SegmentsFilterField`; el barrel del dominio (`Domains/Segments/index.ts`) no requiere cambios.
**Verificar**: `pnpm --filter app tsc`

- [ ] T004 [P] Crear spec del wrapper en `packages/app/src/Domains/Segments/Components/specs/SegmentsFilterField.spec.tsx` con los casos T1–T5 del plan

**Archivos**: `packages/app/src/Domains/Segments/Components/specs/SegmentsFilterField.spec.tsx` (NUEVO)
**Casos (T1–T5)**: mockear `useHasPermission` de `@app/Application` (preservando `DASHBOARD_ACCESS` y `Container` en el mock) y stub `./SegmentsFilter`. T1: admin → renderiza etiqueta "Segmentos" + selector (US2, FR-003). T2: empleado → retorna `null`, ni etiqueta ni selector en el DOM (US1, FR-001/002). T3: permisos en carga (`hasPermission` false) → `null`, sin flash (FR-008). T4: `showLabel={false}` con permiso → selector sin etiqueta (FR-009). T5: `showLabel={false}` sin permiso → `null` (defensa en profundidad).
**Aceptación**: T1–T5 verdes con datos concretos (Pr. V — no stubs de bodega).
**Verificar**: `pnpm --filter app test -- src/Domains/Segments/Components/specs/SegmentsFilterField.spec.tsx`

**Checkpoint F1**: `pnpm --filter app tsc` + `pnpm --filter app test` verdes. Foundation ready — los user stories pueden empezar.

---

## Phase 3: User Story 1 + User Story 2 — Visibilidad del bloque en formularios (Priority: P1, P1) 🎯 MVP — F2 del plan

**Goal**: Aplicar `<SegmentsFilterField />` en ambos formularios: el empleado sin `DASHBOARD_ACCESS` NO ve el bloque (US1, FR-001/002), el admin SÍ lo ve completo e idéntico al actual (US2, FR-003). Un único cambio atómico cubre ambas stories (label `[US1|US2]`).

**Independent Test**: Autenticar un usuario sin `DASHBOARD_ACCESS`, abrir ambos formularios → el bloque "Segmentos" (etiqueta + selector) no se renderiza y el resto de campos se ve normal; autenticar un admin → el bloque se ve y filtra igual que antes.

- [ ] T005 [P] [US1|US2] Reemplazar el bloque de segmentos por `<SegmentsFilterField />` en `packages/app/src/Domains/Documents/Components/FiltersDocumentsForm/FiltersDocumentsForm.tsx`

**Archivos**: `packages/app/src/Domains/Documents/Components/FiltersDocumentsForm/FiltersDocumentsForm.tsx` (MODIFICADO, líneas 110–113)
**Detalle**: reemplazar `<Container space="small"><Label>Segmentos</Label><SegmentsFilter /></Container>` por `<SegmentsFilterField />`; swap del import `{ SegmentsFilter }` → `{ SegmentsFilterField }` desde `@app/Domains/Segments` (línea 18). `Container` y `Label` se mantienen importados (se usan en los otros campos). Sin tocar `updateParams`/`cleanFilters`: `updateParams` mergea sobre el `URLSearchParams` existente y nunca borra `segmentos`; `cleanFilters` no llama a `updateParams` (FR-006 garantizado).
**Aceptación**: US1 escenario 1 (empleado: sin etiqueta ni selector; nombre/estado/tipo intactos, sin huecos de layout — escenario 4) y US2 escenario 1 (admin: etiqueta "Segmentos" + selector con "Filtrar por segmentos").
**Verificar**: `pnpm --filter app tsc` + casos T6/T7 (T007)

- [ ] T006 [P] [US1|US2] Reemplazar el bloque de segmentos por `<SegmentsFilterField />` en `packages/app/src/Domains/Certificates/Components/FiltersCertificatesForm.tsx`

**Archivos**: `packages/app/src/Domains/Certificates/Components/FiltersCertificatesForm.tsx` (MODIFICADO, líneas 207–210)
**Detalle**: ídem T005; swap del import en línea 20. `Container`/`Label`/`isAdmin` y el resto de los campos (tipo/fecha/año/estado) sin cambios.
**Aceptación**: US1 escenario 2 (empleado: sin bloque; tipo/fecha/año/estado intactos) y US2 escenario 2 (admin: bloque visible con estado por defecto).
**Verificar**: `pnpm --filter app tsc` + casos T8/T9 (T008)

- [ ] T007 [P] [US1|US2] Crear spec de visibilidad en `packages/app/src/Domains/Documents/Components/FiltersDocumentsForm/specs/FiltersDocumentsForm.spec.tsx` con los casos T6–T7 del plan

**Archivos**: `packages/app/src/Domains/Documents/Components/FiltersDocumentsForm/specs/FiltersDocumentsForm.spec.tsx` (NUEVO)
**Casos**: mockear `useGetDocumentsTypes` y `useHasPermission`; render con `QueryClientProvider` + `MemoryRouter` (el form usa `useURLParams`). T6: admin → se ve "Segmentos" + campos nombre/estado/tipo (FR-003/007). T7: empleado → NO se ve "Segmentos"; resto de campos intactos y sin huecos de layout (US1, FR-001/007).
**Aceptación**: T6–T7 verdes.
**Verificar**: `pnpm --filter app test -- src/Domains/Documents/Components/FiltersDocumentsForm/specs/FiltersDocumentsForm.spec.tsx`

- [ ] T008 [P] [US1|US2] Crear spec de visibilidad en `packages/app/src/Domains/Certificates/Components/specs/FiltersCertificatesForm.spec.tsx` con los casos T8–T9 del plan

**Archivos**: `packages/app/src/Domains/Certificates/Components/specs/FiltersCertificatesForm.spec.tsx` (NUEVO)
**Casos**: mockear `useGetCertificatesTypes` y `useHasPermission`; render con `QueryClientProvider` + `MemoryRouter`; proveer props `availableYears` y `isAdmin`. T8: admin → se ve "Segmentos" + campos tipo/fecha/año/estado (FR-003/007). T9: empleado → NO se ve "Segmentos"; resto intacto (US1, FR-002/007).
**Aceptación**: T8–T9 verdes.
**Verificar**: `pnpm --filter app test -- src/Domains/Certificates/Components/specs/FiltersCertificatesForm.spec.tsx`

**Checkpoint F2**: `pnpm --filter app tsc` + `pnpm --filter app test` verdes (T1–T9). **MVP completo**: US1 y US2 funcionales en ambos formularios.

---

## Phase 4: User Story 3 — El parámetro `segmentos` sigue filtrando sin control visible (Priority: P2) — sin fase F del plan (garantía de diseño)

**Goal**: No-regresión de datos: aunque el control esté oculto para el empleado, si la URL contiene `segmentos` los resultados siguen filtrados y el parámetro permanece al aplicar/limpiar otros filtros (US3, FR-005/006, SC-003/004).

**Sin tareas de implementación**: garantizado por diseño (plan.md §Decisiones 3) — `SegmentsFilter` (quien lee/escribe `segmentos` en la URL) NO se toca; ocultar el wrapper solo desmonta el selector, que no puede escribir en la URL; `updateParams` de los forms mergea sobre el `URLSearchParams` existente sin borrar `segmentos`; `cleanFilters` no llama a `updateParams`.

**Independent Test**: Autenticar un empleado, navegar a Documentos (o Certificados) con `segmentos` presente en la URL → resultados filtrados y el parámetro permanece en la URL.

**Criterios de aceptación (verificación diferida a Phase 6, T013)**:

1. Empleado con `?segmentos=1,2` en Documentos → lista filtrada aunque el control esté oculto.
2. Al aplicar otros filtros → `segmentos` permanece y el filtrado continúa.
3. Al limpiar filtros → `segmentos` NO se elimina de la URL (consecuencia aceptada de la regla de negocio 3; no es un bug, se documenta).

---

## Phase 5: User Story 4 — Consistencia en `UserSegmentsToolbar` (Priority: P3) — F3 del plan

**Goal**: La toolbar de "Segmentos por usuario" aplica la misma regla con `showLabel={false}`: el admin conserva el selector sin etiqueta (cero cambios visuales), el empleado no ve el selector como defensa en profundidad (FR-009).

**Independent Test**: Admin entra a "Segmentos por usuario" → filtro visible sin etiqueta, igual que hoy; el empleado no accede a la ruta (protección existente, sin cambios).

- [ ] T009 [US4] Reemplazar `<SegmentsFilter />` por `<SegmentsFilterField showLabel={false} />` en `packages/app/src/Domains/Segments/Components/UserSegments/UserSegmentsToolbar.tsx`

**Archivos**: `packages/app/src/Domains/Segments/Components/UserSegments/UserSegmentsToolbar.tsx` (MODIFICADO, líneas 52–54)
**Detalle**: `<SegmentsFilter />` → `<SegmentsFilterField showLabel={false} />`; swap del import relativo `../SegmentsFilter` → `../SegmentsFilterField` (línea 5). El `div.w-full sm:w-64` externo se mantiene (layout intacto).
**Aceptación**: US4 escenario 1 (admin: selector visible, SIN etiqueta "Segmentos", como hasta ahora); FR-009.
**Verificar**: `pnpm --filter app tsc` + casos T10/T11 (T010)

- [ ] T010 [US4] Crear spec en `packages/app/src/Domains/Segments/Components/UserSegments/specs/UserSegmentsToolbar.spec.tsx` con los casos T10–T11 del plan

**Archivos**: `packages/app/src/Domains/Segments/Components/UserSegments/specs/UserSegmentsToolbar.spec.tsx` (NUEVO)
**Casos**: mockear `useHasPermission` y stub `SegmentsFilter`/`SegmentsFilterField` (aislar la regla). T10: admin → selector visible, sin etiqueta "Segmentos" (US4 escenario 1). T11: empleado → selector ausente (defensa en profundidad; en producción la ruta está protegida — US4 escenario 2).
**Aceptación**: T10–T11 verdes.
**Verificar**: `pnpm --filter app test -- src/Domains/Segments/Components/UserSegments/specs/UserSegmentsToolbar.spec.tsx`

**Checkpoint F3**: `pnpm --filter app tsc` + `pnpm --filter app test` verdes (T1–T11).

---

## Phase 6: Polish & Cross-Cutting Concerns — F4 del plan: verificación integral y cierre

**Purpose**: Gates automáticos completos + smoke manual de las 4 user stories + cierre del pipeline. Depende de que F1–F3 estén completas.

- [ ] T011 [P] Verificar TypeScript estricto sin errores: `pnpm --filter app tsc`

**Archivos**: ninguno (solo ejecución)
**Aceptación**: 0 errores de `tsc` en todo `packages/app` (Pr. III).
**Verificar**: `pnpm --filter app tsc`

- [ ] T012 [P] Verificar suite completa sin fallos: `pnpm --filter app test`

**Archivos**: ninguno (solo ejecución)
**Aceptación**: 0 tests fallidos — T1–T11 verdes (Pr. V) + suite de regresión existente.
**Verificar**: `pnpm --filter app test`

- [ ] T013 [P] [US3] Smoke manual US3 — no-regresión del parámetro `segmentos` en URL (escenarios de Validación del plan: US3, FR-005/006)

**Archivos**: ninguno (validación manual con `pnpm app:dev`)
**Pasos**: login como empleado (sin `DASHBOARD_ACCESS`); navegar a Documentos con `?segmentos=1,2` en la URL; aplicar y limpiar otros filtros del formulario; repetir en Certificados.
**Aceptación**: resultados filtrados por los segmentos indicados aunque el control esté oculto; el parámetro `segmentos` permanece en la URL al aplicar/limpiar otros filtros (SC-003/004); se documenta la consecuencia aceptada (sin control visible para limpiar el filtro, no es bug).
**Verificar**: smoke manual según tabla de Validación del plan.md.

- [ ] T014 [P] Smoke manual US1, US2, US4 + FR-008 + regresión (escenarios de Validación del plan)

**Archivos**: ninguno (validación manual con `pnpm app:dev`)
**Pasos**: (1) empleado: ambos forms sin bloque, resto de campos normales, sin huecos; (2) admin: bloque completo en ambos forms, seleccionar segmentos actualiza URL con `segmentos`; (3) admin: "Segmentos por usuario" con filtro sin etiqueta; empleado no accede a la ruta; (4) FR-008: con throttle en DevTools, login como empleado → el bloque nunca aparece ni parpadea durante la carga de permisos; (5) regresión: nombre/estado/tipo (Docs) y tipo/fecha/año/estado (Certs) idénticos al actual en ambos perfiles.
**Aceptación**: SC-001, SC-002, SC-005 cumplidos; cero cambios de layout en los demás campos.
**Verificar**: smoke manual según tabla de Validación del plan.md.

- [ ] T015 Cerrar la feature: `pnpm --filter app lint` (0 errores) + registro en `memory/history_log.json` (task_id `TASK-feat-segments-filter-access-YYYYMMDD-N`) + commits convencionales por fase

**Archivos**: `memory/history_log.json` (MODIFICADO); commits por fase según Pr. VI (p. ej. `feat(segments): ocultar bloque de filtro sin DASHBOARD_ACCESS`), sin atribución IA, sin `--no-verify`.
**Aceptación**: lint 0 errores; `history_log.json` refleja el cierre del pipeline (implement → tester → qa → reviewer); los commits cumplen Conventional Commits con scope `segments`.
**Verificar**: `pnpm --filter app lint` + `git log --oneline -10`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — baseline verde obligatorio antes de cualquier cambio.
- **Foundational (Phase 2 / F1)**: depende de Phase 1. **BLOQUEA US1, US2 y US4** (todos consumen `SegmentsFilterField`).
- **US1+US2 (Phase 3 / F2)**: depende de Phase 2.
- **US4 (Phase 5 / F3)**: depende de Phase 2 (usa el mismo wrapper).
- **US3 (Phase 4 / P2)**: sin tareas de implementación (garantía de diseño); su verificación (T013) depende de que Phase 3 esté completa (los forms ya usan el wrapper).
- **Polish (Phase 6 / F4)**: depende de Phases 2, 3 y 5 (y de la ejecución de T013).

### Orden de ejecución que mantiene el repo compilable (grafo de dependencias)

```text
T001
  └─→ T002 ─┬─→ T003 [P]
            └─→ T004 [P]
  ─────────────────────
  T003, T004 → T005 [P] ─→ T007 [P]
             → T006 [P] ─→ T008 [P]
  ─────────────────────
  T002 → T009 ─→ T010
  ─────────────────────
  T011 [P], T012 [P], T013 [P] (tras Phase 3), T014 [P]
  └─→ T015
```

### Orden de completitud por user story

- **US1 + US2 (P1)**: se completan al terminar Phase 3 (F2). **MVP = Phases 1–3** (F1 + F2): empleado no ve el bloque, admin sí, en ambos formularios.
- **US4 (P3)**: se completa al terminar Phase 5 (F3).
- **US3 (P2)**: se verifica al terminar Phase 6 (T013) — no tiene código propio.
- **Cierre**: Phase 6 (F4) valida integralmente antes del handoff a QA/reviewer.

### Within Each User Story

- Componente/wrapper (F1) antes que los consumidores (F2/F3) — dependency inversion: la regla vive en el dominio Segments, los forms no la conocen (opción b).
- Implementación antes que specs (Pr. V: `@blendverse-tester` genera los tests tras el código; los casos T1–T11 quedan definidos como contrato).
- Story completa antes de pasar a la siguiente prioridad.

### Parallel Opportunities

- T003 y T004 (barrel + spec del wrapper) — archivos distintos, ambos dependen solo de T002.
- T005 y T006 (Docs y Certs forms) — archivos distintos, sin dependencias entre sí.
- T007 y T008 (specs de forms) — archivos distintos; cada uno depende solo de su form (T005/T006).
- T011, T012, T013 y T014 (gates + smokes) — independientes entre sí.
- US1+US2 (Phase 3) y US4 (Phase 5) NO son paralelizables antes de Phase 2, pero tras F1 podrían trabajarse en paralelo por dos devs (T005/T006 por un lado, T009 por otro) — ojo: T009 no depende de T005/T006, solo de T002.

### Parallel Example: User Story 1 + 2 (tras F1)

```bash
# Forms en paralelo:
Task: "T005 [US1|US2] FiltersDocumentsForm.tsx — reemplazar bloque por SegmentsFilterField"
Task: "T006 [US1|US2] FiltersCertificatesForm.tsx — reemplazar bloque por SegmentsFilterField"

# Specs de forms en paralelo (tras sus forms):
Task: "T007 [P] [US1|US2] spec FiltersDocumentsForm (casos T6-T7)"
Task: "T008 [P] [US1|US2] spec FiltersCertificatesForm (casos T8-T9)"
```

---

## Implementation Strategy

### MVP First (US1 + US2 only)

1. Phase 1: baseline verde (T001).
2. Phase 2 (F1): `SegmentsFilterField` + barrel + spec T1–T5 (T002–T004).
3. Phase 3 (F2): aplicar en ambos forms + specs T6–T9 (T005–T008).
4. **STOP and VALIDATE**: `pnpm --filter app tsc && pnpm --filter app test` — US1 y US2 testeadas independientemente.
5. Deploy/demo si se desea: el MVP entrega el 100% del valor de la feature (SC-001/002).

### Incremental Delivery

1. Setup + Foundational → foundation ready (wrapper con regla, sin consumidores).
2. - US1/US2 → **MVP** (empleado sin bloque, admin con bloque) → test independiente → deploy/demo.
3. - US4 (F3) → consistencia admin-only, cero cambios visuales → test independiente.
4. - US3 + F4 → verificación integral (tsc/test/lint + smokes) → cierre del pipeline.

### Parallel Team Strategy

- Dev A: F1 (T002–T004) → F2 forms Docs (T005, T007).
- Dev B: tras F1, F2 forms Certs (T006, T008) y F3 (T009–T010).
- QA/Reviewer: Phase 6 (T011–T015) tras el handoff.

---

## Notes

- **[P]**: tareas en archivos distintos, sin dependencias entre sí.
- **[Story]**: `[US1|US2]` = cambio atómico que implementa ambas stories P1 (mismo componente, mismos tests T6–T9); `[US3]` solo tiene verificación (T013), sin código.
- Cada user story es independientemente testeable: US1/US2 vía specs T6–T9 + smoke; US3 vía T013; US4 vía T10/T11 + smoke.
- Testear con datos concretos (Pr. V), no stubs de bodega; mockear `useHasPermission`/`useGetPermissions` y los hooks de tipos en los specs de forms (requieren `QueryClientProvider` + `MemoryRouter` por `useURLParams`).
- No tocar `SegmentsFilter.tsx`, `useURLParams`, `updateParams` ni `cleanFilters`: FR-005/FR-006 dependen de que el código de URL quede intacto.
- Consecuencia aceptada (regla de negocio 3): empleado con `segmentos` en la URL ve resultados filtrados sin control para limpiarlos — no es bug.
- Commit por fase o grupo lógico con Conventional Commits scope `segments` (Pr. VI).
- Fuera de scope (spec.md §Assumptions): modelo de permisos, rutas nuevas, filtrado backend, limpieza de `segmentos` en la URL.
