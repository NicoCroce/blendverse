# Tasks: multiempresas-usuarios

**Feature Branch**: `feat/multiempresas-usuarios`
**Spec**: `specs/multiempresas-usuarios/spec.md`
**Plan**: `specs/multiempresas-usuarios/plan.md`
**Contrato**: `specs/multiempresas-usuarios/contracts/empresas-usuarios.contracts.ts`
**Generado**: 2026-06-10

---

## Formato: `[ID] [P?] [Story?] Descripción con ruta de archivo`

- **[P]**: Puede ejecutarse en paralelo con otras tareas marcadas [P] del mismo bloque
- **[Story]**: User story a la que pertenece la tarea (US1, US2, US3)
- Las fases de Setup y Foundational no llevan etiqueta de story

---

## Phase 1: Setup

**Propósito**: Verificar que la rama activa es la correcta; no hay setup de proyecto (el monorepo ya está inicializado).

- [ ] T001 Verificar que la rama activa es `feat/multiempresas-usuarios` y que no hay conflictos en `packages/server/src/domains/register.ts` ni en `packages/server/src/Infrastructure/Routes/index.ts` antes de comenzar

---

## Phase 2: Foundational (Capa de Dominio + Modelo Sequelize)

**Propósito**: Capa `Domain/` del nuevo dominio y modelo Sequelize. Estos artefactos bloquean todas las user stories.

⚠️ **CRÍTICO**: Ninguna user story puede comenzar hasta que esta fase esté completa.

- [ ] T002 [P] Crear entidad `EmpresaUsuario` con `static create(props)` y getter `values` que expone `{ id, id_empresa, id_usuario }` en `packages/server/src/domains/Empresas_usuarios/Domain/EmpresasUsuarios.entity.ts`
- [ ] T003 [P] Crear interfaz `IEmpresasUsuariosRepository` con método `findByUsuario(userId: number): Promise<EmpresaUsuario[]>` en `packages/server/src/domains/Empresas_usuarios/Domain/EmpresasUsuarios.repository.ts`
- [ ] T004 [P] Crear tipo de dominio `IEmpresaUsuario { id: number; id_empresa: number; id_usuario: number }` en `packages/server/src/domains/Empresas_usuarios/Domain/EmpresasUsuarios.types.ts`
- [ ] T005 [P] Crear modelo Sequelize `EmpresasUsuariosModel` (tabla `Empresas_usuarios`, `paranoid: true`, campos: `id`, `id_empresa`, `id_usuario`, `createdAt`, `updatedAt`, `deletedAt`) con `EmpresasUsuariosModel.belongsTo(OwnersysModel, { foreignKey: 'id_empresa', as: 'Empresa' })` en `packages/server/src/domains/Empresas_usuarios/Infrastructure/Database/EmpresasUsuarios.model.ts`
- [ ] T006 [P] Crear barrel `packages/server/src/domains/Empresas_usuarios/Domain/index.ts` re-exportando entidad, repositorio y tipos

**Checkpoint**: Domain layer completa — la implementación de Application puede comenzar.

---

## Phase 3: User Story 1 — Consulta de empresas asociadas al usuario (Priority: P1) 🎯 MVP

**Goal**: Exponer el procedimiento tRPC `empresasUsuarios.getByUsuario` que, dado un `userId`, retorna `Array<{ id, razon_social, cuit, logo }>` consultando `Empresas_usuarios` con eager-load de `Sis_propietarios`.

**Independent Test**: Ejecutar el use case directamente con un `userId` válido y verificar que el repositorio retorna las empresas con datos de `Sis_propietarios` correctamente mapeados a la entidad de dominio.

### Application Layer

- [ ] T007 [P] [US1] Crear tipos de Application con `IGetEmpresasByUsuarioInput` y `IGetEmpresasByUsuarioOutput` usando `z.infer` de `GetEmpresasByUsuarioInputSchema` y `GetEmpresasByUsuarioOutputSchema` del contrato en `packages/server/src/domains/Empresas_usuarios/Application/empresasUsuarios.types.ts`
- [ ] T008 [US1] Crear use case `GetEmpresasByUsuario` implementando `IUseCase<GetEmpresasByUsuarioInput, GetEmpresasByUsuarioOutput>` — ejecuta `this.repository.findByUsuario(input.userId)` y mapea a `EmpresaItem[]` en `packages/server/src/domains/Empresas_usuarios/Application/UseCases/GetEmpresasByUsuario.usecase.ts`
- [ ] T009 [US1] Crear barrels `packages/server/src/domains/Empresas_usuarios/Application/UseCases/index.ts` y `packages/server/src/domains/Empresas_usuarios/Application/index.ts`
- [ ] T010 [US1] Crear `EmpresasUsuariosService` con método `getByUsuario` que delega al use case vía `executeUseCase` en `packages/server/src/domains/Empresas_usuarios/Application/EmpresasUsuarios.service.ts`

### Infrastructure Layer — Database

- [ ] T011 [US1] Crear `EmpresasUsuariosRepositoryImplementation` implementando `IEmpresasUsuariosRepository` — `findAll({ where: { id_usuario: userId }, include: [{ model: OwnersysModel, as: 'Empresa', attributes: ['id', 'razon_social', 'cuit', 'logo'] }] })` — mapea rows a entidades de dominio en `packages/server/src/domains/Empresas_usuarios/Infrastructure/Database/EmpresasUsuariosRepository.implementation.ts`
- [ ] T012 [P] [US1] Crear barrel `packages/server/src/domains/Empresas_usuarios/Infrastructure/Database/index.ts`

### Infrastructure Layer — Controller

- [ ] T013 [US1] Crear `EmpresasUsuariosController` con `protectedProcedure.input(GetEmpresasByUsuarioInputSchema).query(async ({ input, ctx }) => executeService(service.getByUsuario, input))` en `packages/server/src/domains/Empresas_usuarios/Infrastructure/Controllers/EmpresasUsuarios.controller.ts`
- [ ] T014 [P] [US1] Crear barrel `packages/server/src/domains/Empresas_usuarios/Infrastructure/Controllers/index.ts`

### Infrastructure Layer — Routes

- [ ] T015 [US1] Crear router tRPC con `{ getByUsuario: EmpresasUsuariosController }` y `Router.ts` que exporta `EmpresasUsuariosRoutes` en `packages/server/src/domains/Empresas_usuarios/Infrastructure/Routes/EmpresasUsuarios.routes.ts` y `packages/server/src/domains/Empresas_usuarios/Infrastructure/Routes/Router.ts`
- [ ] T016 [P] [US1] Crear barrels `packages/server/src/domains/Empresas_usuarios/Infrastructure/Routes/index.ts` y `packages/server/src/domains/Empresas_usuarios/Infrastructure/index.ts`

### DI y Registro Global

- [ ] T017 [US1] Crear `empresasUsuarios.di.ts` con `asClass` para repositorio, use case, servicio y controlador — exportar `empresasUsuariosApp` en `packages/server/src/domains/Empresas_usuarios/empresasUsuarios.di.ts`
- [ ] T018 [US1] Crear barrel global del dominio `packages/server/src/domains/Empresas_usuarios/index.ts` (re-exporta todos los artefactos públicos)
- [ ] T019 [US1] Modificar `packages/server/src/domains/register.ts` — importar `empresasUsuariosApp` desde `./Empresas_usuarios` y hacer spread en el objeto de registro junto a los demás dominios
- [ ] T020 [US1] Modificar `packages/server/src/Infrastructure/Routes/index.ts` — importar `EmpresasUsuariosRoutes` y agregar `empresasUsuarios: EmpresasUsuariosRoutes` al objeto `AllRouters`

**Checkpoint**: El endpoint tRPC `empresasUsuarios.getByUsuario` debe responder correctamente. Verificable con cliente tRPC o test unitario del use case.

---

## Phase 4: User Story 2 — Pantalla de selección de empresa post-login (Priority: P2)

**Goal**: Crear la ruta `/seleccionar-empresa` que muestra un `EmpresaCard` por empresa con imagen (o fallback), `razon_social` y `cuit`. Solo visualización, sin lógica de selección.

**Independent Test**: Renderizar `SeleccionarEmpresa.page.tsx` con un array mockeado de 2+ empresas y verificar que aparece un `EmpresaCard` por empresa con imagen, `razon_social` y `cuit`.

### Servicio tRPC y Rutas

- [ ] T021 [P] [US2] Crear constante `SELECCIONAR_EMPRESA_ROUTE = '/seleccionar-empresa'` en `packages/app/src/Domains/EmpresasUsuarios/EmpresasUsuarios.routes.ts`
- [ ] T022 [P] [US2] Crear cliente tRPC `empresasUsuariosClient` exportando `createTRPCReact<TEmpresasUsuariosRouter>()` en `packages/app/src/Domains/EmpresasUsuarios/EmpresasUsuarios.service.ts`; importar `TEmpresasUsuariosRouter` desde `@server/domains/Empresas_usuarios`

### Hooks

- [ ] T023 [US2] Crear hook `useGetEmpresasByUsuario(userId: number)` que retorna `empresasUsuariosClient.getByUsuario.useQuery({ userId })` en `packages/app/src/Domains/EmpresasUsuarios/Hooks/useGetEmpresasByUsuario.ts` y barrel `packages/app/src/Domains/EmpresasUsuarios/Hooks/index.ts`

### Componentes y Páginas

- [ ] T024 [P] [US2] Crear componente presentacional `EmpresaCard` que recibe `EmpresaItem` como prop — muestra `logo` como `<img>` (fallback: inicial de `razon_social` si `logo` es null), `razon_social` y `cuit` con Tailwind CSS — en `packages/app/src/Domains/EmpresasUsuarios/Components/EmpresaCard.tsx` y barrel `packages/app/src/Domains/EmpresasUsuarios/Components/index.ts`
- [ ] T025 [US2] Crear `SeleccionarEmpresa.page.tsx` — consume `useGetEmpresasByUsuario` con el `userId` del contexto de autenticación, renderiza una lista de `EmpresaCard` sin botones interactivos ni lógica de selección — en `packages/app/src/Domains/EmpresasUsuarios/Pages/SeleccionarEmpresa.page.tsx` y barrel `packages/app/src/Domains/EmpresasUsuarios/Pages/index.ts`

### Router y Registros Globales

- [ ] T026 [US2] Crear `EmpresasUsuarios.router.tsx` con `<Route path={SELECCIONAR_EMPRESA_ROUTE} element={<SeleccionarEmpresaPage />} />` en `packages/app/src/Domains/EmpresasUsuarios/EmpresasUsuarios.router.tsx`
- [ ] T027 [US2] Crear barrel global `packages/app/src/Domains/EmpresasUsuarios/index.ts` re-exportando service, routes, router, hooks, pages y components
- [ ] T028 [US2] Modificar `packages/app/src/Domains/index.ts` — agregar `export * from './EmpresasUsuarios'`
- [ ] T029 [US2] Modificar `packages/app/src/Infrastructure/Routes.tsx` — importar `EmpresasUsuariosRouter` y agregarlo al array `AllRoutes`

**Checkpoint**: La ruta `/seleccionar-empresa` debe renderizar la lista visual de empresas cuando se accede directamente.

---

## Phase 5: User Story 3 — Omisión de pantalla para usuario de empresa única (Priority: P2)

**Goal**: Modificar el hook `useLoginUser` para que tras autenticación exitosa consulte las empresas del usuario y navegue condicionalmente: `>= 2 empresas` → `/seleccionar-empresa`; `< 2 empresas` → flujo normal (`DOCUMENTS_ROUTE`).

**Independent Test**: Simular `onSuccess` del hook con datos de usuario y mock de `getByUsuario` retornando 1 empresa — verificar que `navigate` se llama con `DOCUMENTS_ROUTE` y NO con `SELECCIONAR_EMPRESA_ROUTE`.

### Modificación del flujo post-login

- [ ] T030 [US3] Modificar `packages/app/src/Domains/Auth/Hooks/useLoginUser.ts` — en el callback `onSuccess`: tras `setLogged()` y `setQueryData(data)`, llamar directamente (no `useQuery`) a `empresasUsuariosClient.getByUsuario.query({ userId: data.user.values.id })`; si `empresas.length >= 2` → `navigate(SELECCIONAR_EMPRESA_ROUTE)`; si no → `navigate(DOCUMENTS_ROUTE)`; importar `empresasUsuariosClient` desde `@app/Domains/EmpresasUsuarios` y `SELECCIONAR_EMPRESA_ROUTE` desde `@app/Domains/EmpresasUsuarios`

**Checkpoint**: El flujo de login completo debe comportarse correctamente para usuarios con 1 y con 2+ empresas. Verificar ambos casos manualmente o con test.

---

## Phase 6: Polish & Integración

**Propósito**: Verificación de tipos TypeScript, lint y ejecución de tests para confirmar que la implementación no rompe el sistema existente.

- [ ] T031 [P] Ejecutar `pnpm --filter server tsc --noEmit` — resultado esperado: 0 errores de TypeScript en el server
- [ ] T032 [P] Ejecutar `pnpm --filter app tsc --noEmit` — resultado esperado: 0 errores de TypeScript en el frontend
- [ ] T033 Ejecutar `pnpm --filter server vitest run` — los tests del dominio `Empresas_usuarios` pasan
- [ ] T034 Ejecutar `pnpm --filter app vitest run` — los tests modificados del dominio `Auth` y los del dominio `EmpresasUsuarios` pasan

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
  └─► Phase 2 (Foundational — Domain layer + Sequelize model)
        └─► Phase 3 (US1 — Backend completo)
              └─► Phase 4 (US2 — Frontend pantalla selección)
                    └─► Phase 5 (US3 — Lógica condicional post-login)
                          └─► Phase 6 (Polish / Integración)
```

- **Setup (Phase 1)**: Sin dependencias
- **Foundational (Phase 2)**: Depende de Phase 1 — **BLOQUEA** todas las user stories
- **US1 Backend (Phase 3)**: Depende de Phase 2 completa
- **US2 Frontend (Phase 4)**: Depende de Phase 3 completa (`TEmpresasUsuariosRouter` debe estar exportado y compilable)
- **US3 Frontend (Phase 5)**: Depende de Phase 4 completa (`empresasUsuariosClient` y `SELECCIONAR_EMPRESA_ROUTE` disponibles)
- **Polish (Phase 6)**: Depende de Phases 3, 4 y 5

### User Story Dependencies

| Story | Depende de | Puede comenzar tras                                     |
| ----- | ---------- | ------------------------------------------------------- |
| US1   | Phase 2    | Foundational completo                                   |
| US2   | US1        | Phase 3 completo (tipos del router tRPC)                |
| US3   | US2        | Phase 4 completo (service y route del dominio frontend) |

### Within US1 (Backend) — Orden Interno

```
T002, T003, T004, T005, T006 (paralelo)
  └─► T007, T008 (T007 paralelo con prep de T008)
        └─► T008 → T010 (use case → service)
        └─► T011 (repo impl, paralela con T010)
              └─► T013 (controller, depende de T010)
                    └─► T015 (routes)
                          └─► T017 (DI)
                                └─► T019, T020 (register global)
```

### Within US2 (Frontend) — Orden Interno

```
T021, T022 (paralelo — service + routes)
  └─► T023 (hook depende de service)
  T024 (paralelo — componente presentacional)
    └─► T025 (page depende de hook + component)
          └─► T026 (router depende de page + routes)
                └─► T027 → T028 → T029 (barrels + registros globales)
```

### Parallel Opportunities

**Phase 2**: T002, T003, T004, T005, T006 — todos en paralelo (archivos independientes)

**Phase 3**:

- T007 en paralelo con preparación de T008
- T011 (repo impl) en paralelo con T010 (service) — archivos distintos
- T012, T014, T016 (barrels) en paralelo con sus pares de implementación

**Phase 4**:

- T021 y T022 (routes + service) en paralelo
- T024 (EmpresaCard) en paralelo con T023 (hook)

---

## Parallel Execution Example: Phase 2 (Foundational)

```bash
# Ejecutar en terminales separadas simultáneamente:

# Terminal 1
# Crear: Domain/EmpresasUsuarios.entity.ts   (T002)

# Terminal 2
# Crear: Domain/EmpresasUsuarios.repository.ts  (T003)

# Terminal 3
# Crear: Domain/EmpresasUsuarios.types.ts   (T004)

# Terminal 4
# Crear: Infrastructure/Database/EmpresasUsuarios.model.ts  (T005)

# Al finalizar los 4 → crear Domain/index.ts (T006) y continuar con Phase 3
```

---

## MVP Scope

El **MVP mínimo** es completar **Phases 1 → 3** (US1 completo):

- ✅ Endpoint `empresasUsuarios.getByUsuario` funcional
- ✅ Retorna `Array<{ id, razon_social, cuit, logo }>` correctamente
- ✅ Verificable con cliente tRPC o test unitario

US2 y US3 se construyen sobre este MVP y pueden entregarse en la misma iteración.

---

## Resumen de Archivos

### Backend — Crear (17 archivos)

| Archivo                                                                                                              | Tarea |
| -------------------------------------------------------------------------------------------------------------------- | ----- |
| `packages/server/src/domains/Empresas_usuarios/Domain/EmpresasUsuarios.entity.ts`                                    | T002  |
| `packages/server/src/domains/Empresas_usuarios/Domain/EmpresasUsuarios.repository.ts`                                | T003  |
| `packages/server/src/domains/Empresas_usuarios/Domain/EmpresasUsuarios.types.ts`                                     | T004  |
| `packages/server/src/domains/Empresas_usuarios/Domain/index.ts`                                                      | T006  |
| `packages/server/src/domains/Empresas_usuarios/Application/empresasUsuarios.types.ts`                                | T007  |
| `packages/server/src/domains/Empresas_usuarios/Application/UseCases/GetEmpresasByUsuario.usecase.ts`                 | T008  |
| `packages/server/src/domains/Empresas_usuarios/Application/UseCases/index.ts`                                        | T009  |
| `packages/server/src/domains/Empresas_usuarios/Application/EmpresasUsuarios.service.ts`                              | T010  |
| `packages/server/src/domains/Empresas_usuarios/Application/index.ts`                                                 | T009  |
| `packages/server/src/domains/Empresas_usuarios/Infrastructure/Database/EmpresasUsuarios.model.ts`                    | T005  |
| `packages/server/src/domains/Empresas_usuarios/Infrastructure/Database/EmpresasUsuariosRepository.implementation.ts` | T011  |
| `packages/server/src/domains/Empresas_usuarios/Infrastructure/Database/index.ts`                                     | T012  |
| `packages/server/src/domains/Empresas_usuarios/Infrastructure/Controllers/EmpresasUsuarios.controller.ts`            | T013  |
| `packages/server/src/domains/Empresas_usuarios/Infrastructure/Controllers/index.ts`                                  | T014  |
| `packages/server/src/domains/Empresas_usuarios/Infrastructure/Routes/EmpresasUsuarios.routes.ts`                     | T015  |
| `packages/server/src/domains/Empresas_usuarios/Infrastructure/Routes/Router.ts`                                      | T015  |
| `packages/server/src/domains/Empresas_usuarios/Infrastructure/Routes/index.ts`                                       | T016  |
| `packages/server/src/domains/Empresas_usuarios/Infrastructure/index.ts`                                              | T016  |
| `packages/server/src/domains/Empresas_usuarios/empresasUsuarios.di.ts`                                               | T017  |
| `packages/server/src/domains/Empresas_usuarios/index.ts`                                                             | T018  |

### Backend — Modificar (2 archivos)

| Archivo                                              | Tarea |
| ---------------------------------------------------- | ----- |
| `packages/server/src/domains/register.ts`            | T019  |
| `packages/server/src/Infrastructure/Routes/index.ts` | T020  |

### Frontend — Crear (12 archivos)

| Archivo                                                                       | Tarea |
| ----------------------------------------------------------------------------- | ----- |
| `packages/app/src/Domains/EmpresasUsuarios/EmpresasUsuarios.routes.ts`        | T021  |
| `packages/app/src/Domains/EmpresasUsuarios/EmpresasUsuarios.service.ts`       | T022  |
| `packages/app/src/Domains/EmpresasUsuarios/Hooks/useGetEmpresasByUsuario.ts`  | T023  |
| `packages/app/src/Domains/EmpresasUsuarios/Hooks/index.ts`                    | T023  |
| `packages/app/src/Domains/EmpresasUsuarios/Components/EmpresaCard.tsx`        | T024  |
| `packages/app/src/Domains/EmpresasUsuarios/Components/index.ts`               | T024  |
| `packages/app/src/Domains/EmpresasUsuarios/Pages/SeleccionarEmpresa.page.tsx` | T025  |
| `packages/app/src/Domains/EmpresasUsuarios/Pages/index.ts`                    | T025  |
| `packages/app/src/Domains/EmpresasUsuarios/EmpresasUsuarios.router.tsx`       | T026  |
| `packages/app/src/Domains/EmpresasUsuarios/index.ts`                          | T027  |

### Frontend — Modificar (3 archivos)

| Archivo                                               | Tarea |
| ----------------------------------------------------- | ----- |
| `packages/app/src/Domains/Auth/Hooks/useLoginUser.ts` | T030  |
| `packages/app/src/Domains/index.ts`                   | T028  |
| `packages/app/src/Infrastructure/Routes.tsx`          | T029  |
