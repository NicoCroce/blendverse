---
task_id: 'TASK-20260517-1'
agent: 'Analyst_Agent'
status: 'DONE'
version: '1.0.0'
date: '2026-05-17'
---

# Requerimientos: Cobertura integral de testing del login

## Descripcion de la necesidad

El usuario necesita cobertura integral de tests sobre la pantalla de login y su flujo asociado, tanto en frontend como en backend. El objetivo es validar el comportamiento actual del acceso, detectar regresiones y asegurar que el ingreso funcione de punta a punta sin redisenar la funcionalidad existente.

## Alcance

- **Incluye:**
  - Definir cobertura de testing para login en frontend con Vitest.
  - Definir cobertura de testing para login en backend con Vitest.
  - Definir cobertura E2E del flujo de login con Playwright.
  - Cubrir escenarios exitosos y fallidos de autenticacion.
  - Validar integracion entre formulario, mutacion de login, respuesta del backend, cookie/sesion y navegacion post-login.
  - Aclarar las superficies probables del dominio Auth y sus dependencias actuales.

- **Excluye:**
  - Rediseno visual o funcional de la pantalla de login.
  - Cambios de negocio en autenticacion, permisos o recuperacion de contrasena.
  - Cobertura de registro de usuario, logout como feature independiente, restore password y renew password fuera de lo necesario para estabilizar el testing del login.
  - Reemplazo de librerias de testing o reestructuracion global del proyecto.

## Dominio afectado

| Capa   | Dominio | Tipo de cambio |
| ------ | ------- | -------------- |
| server | Auth    | Modificacion   |
| app    | Auth    | Modificacion   |

**Tipo de tarea:** `full-stack`

## Superficies probables involucradas

### Frontend

- `packages/app/src/Domains/Auth/Pages/Login.page.tsx`
- `packages/app/src/Domains/Auth/Components/LoginForm.tsx`
- `packages/app/src/Domains/Auth/Hooks/useLoginUser.ts`
- `packages/app/src/Domains/Auth/Hooks/useLogout.ts`
- `packages/app/src/Domains/Auth/Auth.routes.tsx`
- `packages/app/src/Domains/Auth/Auth.router.tsx`
- `packages/app/src/Domains/Main/Main.routes.tsx`
- `packages/app/src/Application/Helpers/isLogged.ts`

### Backend

- `packages/server/src/domains/Auth/Infrastructure/Controllers/Auth.controller.ts`
- `packages/server/src/domains/Auth/Application/Auth.service.ts`
- `packages/server/src/domains/Auth/Application/UseCases/Login.usecase.ts`
- `packages/server/src/domains/Auth/Infrastructure/Routes/Auth.routes.ts`
- `packages/server/src/domains/Users/Application/UseCases/ValidateUserPassword.usecase.ts`
- `packages/server/src/domains/Permissions/Application/UseCases/GetRoleByUser.usecase.ts`
- `packages/server/src/domains/Ownersyss/Application/UseCases/GetOwnersys.usecase.ts`

## User stories

### US-01: Validar la experiencia de login en frontend

**Como** usuario que intenta ingresar al sistema, **quiero** que la pantalla de login este cubierta con tests de interfaz y comportamiento, **para** asegurar que el formulario valide, informe errores y navegue correctamente.

**Criterios de aceptacion:**

- [ ] El formulario de login queda cubierto con tests de render, labels, inputs y accion principal de submit.
- [ ] Se validan los errores de formulario para email invalido, email vacio y password menor al minimo definido.
- [ ] El submit exitoso cubre la ejecucion de `AuthService.login.useMutation`, la persistencia de estado de login y la navegacion a `MAIN_ROUTE`.
- [ ] El submit fallido cubre la visualizacion de `toast.error(error.message)` sin navegacion exitosa ni persistencia falsa de sesion.
- [ ] Se valida la presencia y navegacion del link a `RESTORE_PASSWORD`.
- [ ] Se cubre el estado de carga del boton para evitar doble envio durante la mutacion.

### US-02: Validar el contrato y la logica de login en backend

**Como** equipo tecnico, **quiero** tests sobre el flujo backend del login, **para** asegurar que el controller, service y use case respondan correctamente ante credenciales validas e invalidas.

**Criterios de aceptacion:**

- [ ] La mutacion `auth.login` queda cubierta verificando validacion de input, invocacion a `AuthService.login` y seteo de cookie `auth_token`.
- [ ] `Login.usecase` queda cubierto en escenario exitoso incluyendo la validacion de usuario, resolucion de rol y obtencion de theme.
- [ ] Se cubren los errores esperados por usuario inexistente y contrasena incorrecta propagados desde `ValidateUserPassword`.
- [ ] El caso exitoso verifica explicitamente que `ownerId` del usuario autenticado se propaga al payload usado para generar el token y a la respuesta consumida por frontend.
- [ ] Se cubre el fallback de `theme` a `1` cuando no exista tema configurado.
- [ ] Si `id` u `ownerId` faltan en el usuario autenticado, el comportamiento actual queda cubierto para prevenir regresiones y exponer la deuda tecnica existente.

### US-03: Validar el login de punta a punta

**Como** usuario final, **quiero** que el ingreso completo al sistema este cubierto con una prueba E2E, **para** confirmar que la pantalla, la autenticacion y la redireccion funcionan en conjunto.

**Criterios de aceptacion:**

- [ ] Existe una prueba Playwright para el login exitoso desde la ruta publica de acceso hasta la navegacion posterior al login.
- [ ] Existe una prueba Playwright para login invalido que permanezca en la pantalla y muestre feedback de error.
- [ ] Los escenarios E2E definen una estrategia estable de datos de prueba, sesion y limpieza, sin depender de credenciales productivas.
- [ ] La precondicion de las pruebas limpia storage/cookies para evitar interferencia del `useLogout` que se ejecuta al montar la pantalla si detecta sesion previa.

## Riesgos

- El repositorio no muestra aun suites E2E activas y `playwright.config.ts` levanta solo el frontend (`pnpm app:dev`), por lo que el flujo full-stack requerira backend de prueba activo o una estrategia controlada de mocks.
- `LoginPage` ejecuta `useLogout()` al montar; si existe `localStorage.logged = true`, la pantalla fuerza limpieza y reload, lo que puede volver inestables los tests si no se define una precondicion clara.
- El controller de login setea cookie `auth_token`, por lo que los tests deberan contemplar manejo de cookies/httpOnly en entorno automatizado.
- `Login.usecase.ts` hoy lanza `Error` crudos si `id` u `ownerId` son `undefined`; la cobertura puede revelar fallas no adaptadas al manejo estandar de `AppError`.
