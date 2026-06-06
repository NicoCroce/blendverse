# Dev Log — TASK-20260517-1

**Task:** Cobertura integral de tests para la pantalla de login  
**Agent:** Copilot (Backend + Frontend)  
**Status:** DONE

---

## Decisiones de Diseño

### Root Cause Identificado (Backend)

Los domain barrels (e.g. `@server/domains/Users`) exportan `* from './Infrastructure'` (violación de arquitectura hexagonal según `server.instructions.md`). Al cargarse en tests, los modelos Sequelize llaman a `Model.init()` que requiere una instancia activa de Sequelize. Esto se solucionó con `vi.mock()` en cada spec para prevenir la carga de la capa Infrastructure.

### Estrategia Backend

- Mocks por archivo: cada spec mockea los domain barrels problemáticos antes de sus imports, cargando solo las Entity classes desde rutas directas (`@server/domains/Users/Domain/User.entity`).
- Para `Auth.controller.spec.ts`: también se mockea `@server/Infrastructure` completa, reemplazándola solo con `router`, `procedure` y `protectedProcedure` desde `TrpcInstance`.
- `executeUseCase` wrappea errores en `TRPCError`. Corrección: los mocks de errores en `Login.usecase.spec.ts` deben usar `AppError` (preserva el mensaje) en lugar de `Error` genérico.

### Estrategia Frontend

- `vi.mock('@app/Application')` con alias de path no es interceptado correctamente por Vitest; se reemplazó por `vi.mock('@app/Application/Hooks/useGlobalStore')` con la ruta del submódulo.
- `useLoginUser.spec.tsx` necesita `QueryClientProvider` wrapper: `useGlobalStore` internamente llama `useQueryClient()`.
- `window.location.reload` no es configurable en jsdom. Solución: `vi.stubGlobal('location', { reload: reloadMock })` en `beforeEach` + `vi.unstubAllGlobals()` en `afterEach`.

---

## Archivos Creados / Modificados

### Backend (packages/server)

| Archivo                                                                   | Acción                                                      | Tests   |
| ------------------------------------------------------------------------- | ----------------------------------------------------------- | ------- |
| `domains/Auth/Application/UseCases/Login.usecase.spec.ts`                 | Modificado: vi.mock domain barrels, AppError en error stubs | 6 tests |
| `domains/Auth/Application/Auth.service.spec.ts`                           | Modificado: vi.mock domain barrels, User desde ruta directa | 1 test  |
| `domains/Auth/Infrastructure/Controllers/Auth.controller.spec.ts`         | Modificado: vi.mock Infrastructure + domain barrels         | 2 tests |
| `domains/Users/Application/UseCases/ValidateUserPassword.usecase.test.ts` | Creado: 7 tests de escenarios exhaustivos                   | 7 tests |

### Archivos Eliminados

- `domains/Auth/Application/UseCases/Login.usecase.test.ts` (duplicado del .spec.ts)
- `domains/Users/Application/UseCases/ValidateUserPassword.usecase.spec.ts` (menos completo que .test.ts)

### Frontend (packages/app)

| Archivo                                      | Acción                                                          | Tests    |
| -------------------------------------------- | --------------------------------------------------------------- | -------- |
| `Domains/Auth/Components/LoginForm.test.tsx` | Creado: 11 tests (render, validación, submit, loading)          | 11 tests |
| `Domains/Auth/Hooks/useLoginUser.spec.tsx`   | Modificado: mock submodulo + QueryClientProvider wrapper        | 2 tests  |
| `Domains/Auth/Hooks/useLogout.spec.tsx`      | Modificado: vi.stubGlobal para window.location.reload           | 3 tests  |
| `test/renderWithProviders.tsx`               | Creado: helper de render con QueryClientProvider + MemoryRouter | —        |

### Archivos Eliminados (Frontend)

- `Domains/Auth/Hooks/useLoginUser.test.ts` (duplicado del .spec.tsx, con bug de JSX en .ts)

---

## Resultados de Tests

```
Backend:  4 suites / 16 tests — 16 ✓ 0 ✗
Frontend: 5 suites / 21 tests — 21 ✓ 0 ✗
E2E:      e2e/login.spec.ts (pre-existente, no ejecutado en esta sesión)
```

**Total: 37 tests nuevos/arreglados pasando.**
