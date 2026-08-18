---
task_id: 'TASK-20260610-1'
agent: 'Reviewer_Agent'
status: 'APPROVED'
attempts: 1
date: '2026-06-10'
---

# Review Log — TASK-20260610-1: multiempresas-usuarios

## Precondición

`03_qa_report.md` → `status: PASS` ✅ — revisión habilitada.

---

## Checklist de 12 Ítems

### 1. 🔴 Arquitectura Hexagonal

✅ **PASS** — Las tres capas están correctamente separadas:

- `Domain/`: entidad, interfaz de repositorio, tipos de dominio.
- `Application/`: use case, service, tipos Zod + inferidos.
- `Infrastructure/`: modelo Sequelize, implementación de repositorio, controlador, rutas.
- DI en archivo dedicado `empresasUsuarios.di.ts` (no en `index.ts`). `index.ts` es barrel puro.

### 2. 🔴 Naming Conventions

✅ **PASS** — Todos los archivos y clases siguen el patrón del proyecto:

- PascalCase para clases: `EmpresaUsuario`, `EmpresasUsuariosService`, `GetEmpresasByUsuario`, `EmpresasUsuariosRepositoryImplementation`, `EmpresasUsuariosController`.
- Sufijos correctos: `.entity.ts`, `.repository.ts`, `.usecase.ts`, `.service.ts`, `.controller.ts`, `.model.ts`, `.implementation.ts`, `.di.ts`.
- Frontend: `EmpresaCard.tsx`, `SeleccionarEmpresa.page.tsx`, `useGetEmpresasByUsuario.ts`.

### 3. 🔴 TypeScript Estricto

✅ **PASS** — Sin ningún uso de `any`. Tipos explícitos en todos los archivos:

- Tipos de Application derivados con `z.infer<>`.
- Tipos de Domain definidos con interfaces (`IEmpresaUsuario`).
- Generics explícitos en `Model<InferAttributes<...>, InferCreationAttributes<...>>`.
- Tipo guard `(item): item is EmpresaItem` en el use case.

### 4. 🔴 Zod como Fuente de Verdad

✅ **PASS** — `GetEmpresasByUsuarioInputSchema` definido en `Application/empresasUsuarios.types.ts` y usado directamente en el controlador como `.input(GetEmpresasByUsuarioInputSchema)`. Los tipos de I/O son `z.infer<>` del schema (no interfaces manuales).

### 5. 🔴 Multi-Tenant

✅ **PASS** — La tabla `Empresas_usuarios` no tiene columna `id_propietario` (decisión de diseño justificada en `02_dev_log.md`). El repositorio filtra exclusivamente por `{ id_usuario: userId }`. No hay acceso cruzado a datos de otro tenant.

### 6. 🔴 Seguridad

✅ **PASS** — El procedimiento tRPC usa `protectedProcedure` (requiere sesión válida). El output expone únicamente `{ id, razon_social, cuit, logo }` — sin campos sensibles (passwords, tokens, emails).

⚠️ **Observación menor:** En `useLoginUser.ts`, `utils.empresasUsuarios.getByUsuario.fetch({ userId: data.id ?? 0 })` — si `data.id` fuera `undefined` post-login (caso prácticamente imposible en producción), se enviaría `userId: 0` que fallará la validación `z.number().int().positive()`. El bloque `catch` lo maneja correctamente navegando a `DOCUMENTS_ROUTE`. No es bloqueante.

### 7. 🔴 Separación de Dominios

✅ **PASS** — No se importa ningún repositorio ni use case del dominio `Ownersyss`. La importación de `OwnersysModel` ocurre únicamente en la capa `Infrastructure/Database` para la asociación Sequelize `belongsTo`, patrón explícitamente prescrito en las Decisiones Técnicas del `01_requirements.md`. Es una excepción válida y documentada de la regla general.

### 8. 🔴 Contratos tRPC

✅ **PASS** — Input validado con `GetEmpresasByUsuarioInputSchema`. Output tipado como `EmpresaItem[]` (schema Zod). `TEmpresasUsuariosRouter` exportado desde el dominio del server y consumido en `EmpresasUsuarios.service.ts` del frontend con `createTRPCReact<TEmpresasUsuariosRouter>()`. Tipado end-to-end correcto.

### 9. Frontend: Hooks y Pages

✅ **PASS** — Separación correcta:

- `useGetEmpresasByUsuario.ts` encapsula la llamada tRPC.
- `EmpresaCard.tsx` es puramente visual (sin lógica de negocio, sin side effects).
- `SeleccionarEmpresaPage` solo orquesta hook + componente, sin lógica de negocio directa.

⚠️ **Observación menor:** `(empresas ?? []).map(...)` — el `?? []` es redundante ya que el hook ya define el default `= []`. Inofensivo pero podría simplificarse.

⚠️ **Observación menor:** La ruta `/seleccionar-empresa` no está explícitamente marcada como protegida en el router global (`Infrastructure/Routes.tsx`). Si un usuario no autenticado accede directamente a esa URL, `dataUser` será `undefined`, generando `useQuery({ userId: 0 })` que fallará en el servidor. Recomendable agregar un guard de autenticación en el router (fuera del scope de esta tarea si no hay un wrapper global ya existente).

### 10. Edge Cases

✅ **PASS** — Todos los edge cases del requerimiento están cubiertos:

- `logo null`: `EmpresaCard.tsx` muestra la inicial de `razon_social` si `logo` es falsy.
- Error de API post-login: `catch` en `useLoginUser.ts` navega a `DOCUMENTS_ROUTE` sin interrumpir el flujo.
- Usuarios con campos enriquecidos faltantes: el use case filtra registros con `razon_social`/`cuit` undefined antes de mapear.
- Lista vacía: `SeleccionarEmpresaPage` renderiza un grid vacío sin crashear.

### 11. Out of Scope

✅ **PASS** — No existe lógica de selección de empresa activa. `EmpresaCard.tsx` no tiene `onClick`, no modifica ningún store, no navega. Cumple estrictamente FR-005: "botones visuales sin lógica de selección".

### 12. Archivos Globales

✅ **PASS** — Todos los archivos de registro global fueron actualizados:

| Archivo                                               | Cambio                                                       | Estado |
| ----------------------------------------------------- | ------------------------------------------------------------ | ------ |
| `packages/server/src/domains/register.ts`             | `empresasUsuariosApp` importado y spreaded                   | ✅     |
| `packages/server/src/Infrastructure/Routes/Router.ts` | `EmpresasUsuariosRoutes` importado y spreaded                | ✅     |
| `packages/app/src/Infrastructure/Routes.tsx`          | `EmpresasUsuariosRouter` importado e incluido en `AllRoutes` | ✅     |
| `packages/app/src/Domains/index.ts`                   | `export * from './EmpresasUsuarios'` agregado                | ✅     |

---

## Resumen de Observaciones

| #   | Tipo | Descripción                                                                                                                       | Bloqueante |
| --- | ---- | --------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | ⚠️   | `userId: data.id ?? 0` en `useLoginUser.ts` — caso imposible en práctica pero técnicamente genera call fallido si id es undefined | No         |
| 2   | ⚠️   | `(empresas ?? [])` redundante en `SeleccionarEmpresaPage` — el hook ya provee default `[]`                                        | No         |
| 3   | ⚠️   | Ruta `/seleccionar-empresa` sin guard de autenticación explícito en el router global                                              | No         |

---

## Status Final

### ✅ APPROVED

Todos los ítems críticos (🔴) pasan. Las observaciones son menores (⚠️) y no representan violaciones de arquitectura, seguridad ni convenciones del proyecto. La implementación es sólida, correctamente estructurada y cumple todos los criterios de aceptación definidos en `01_requirements.md`.

---

## Handoff al Director

➡️ Actualizar `memory/history_log.json` con `status: COMPLETED` y `closed_at: 2026-06-10` para la tarea `TASK-20260610-1`.
