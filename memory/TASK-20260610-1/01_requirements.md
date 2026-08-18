---
task_id: 'TASK-20260610-1'
agent: 'Analyst_Agent'
status: 'DONE'
version: '1.0.0'
date: '2026-06-10'
---

# Requirements — TASK-20260610-1: multiempresas-usuarios

## Contexto

Feature para soporte multi-empresa en el flujo post-login del sistema MacroGest Core.
Branch: `feat/multiempresas-usuarios`
Artefactos Speckit: `specs/multiempresas-usuarios/`

---

## Alcance

**Full-stack** — backend DDD + frontend React.

---

## User Stories

### US1 — Consulta de empresas asociadas al usuario (P1 — MVP)

Como sistema, al finalizar el proceso de autenticación de un usuario, necesito obtener todas las empresas a las que ese usuario pertenece.

**Criterios de aceptación:**

1. Dado un usuario con 3 empresas en `Empresas_usuarios`, retorna lista con 3 empresas incluyendo `razon_social`, `cuit`, `logo` (URL completa) desde `Sis_propietarios`.
2. Dado un usuario con 1 empresa, retorna lista con 1 empresa.
3. Dado un usuario sin empresas, retorna lista vacía.

### US2 — Pantalla de selección de empresa post-login (P2)

Como usuario con 2+ empresas, tras el login debo ser navegado a `/seleccionar-empresa` donde veo mis empresas en formato botón (imagen, razón social, CUIT) — solo visual, sin lógica de selección.

**Criterios de aceptación:**

1. Con 2+ empresas: login navega automáticamente a `/seleccionar-empresa` y muestra un botón por empresa con `logo`, `razon_social` y `cuit`.
2. Los botones son puramente visuales — sin navegación ni cambio de estado.
3. Si `logo` es null, se muestra placeholder o inicial de `razon_social`.

### US3 — Omisión de pantalla para usuario de empresa única (P2)

Como usuario con 1 sola empresa, el login NO debe mostrar la pantalla de selección.

**Criterios de aceptación:**

1. Con 1 empresa: no se navega a `/seleccionar-empresa`, flujo de login normal.
2. Con 0 empresas (caso anómalo): tampoco se muestra la pantalla.

---

## Requisitos Funcionales

| ID      | Descripción                                                                                                               |
| ------- | ------------------------------------------------------------------------------------------------------------------------- |
| FR-001  | Procedimiento tRPC `empresasUsuarios.getByUsuario` — input `{ userId }`, output `Array<{ id, razon_social, cuit, logo }>` |
| FR-002  | Datos de empresa desde `Sis_propietarios`: `id`, `razon_social`, `cuit`, `logo` (URL completa)                            |
| FR-003  | Aislamiento multi-tenant por `id_empresa` en `Empresas_usuarios` (sin columna `id_propietario`)                           |
| FR-004  | Mostrar `/seleccionar-empresa` si y solo si el usuario tiene ≥ 2 empresas                                                 |
| FR-005  | Pantalla `/seleccionar-empresa`: botones visuales con `logo`, `razon_social`, `cuit`; sin lógica de selección             |
| FR-005b | Tras login exitoso con ≥ 2 empresas: navegar automáticamente a `/seleccionar-empresa`                                     |
| FR-006  | Datos NUNCA de tabla `Empresas`; siempre de `Sis_propietarios`                                                            |
| FR-007  | Con 1 empresa: NO mostrar pantalla de selección                                                                           |
| FR-008  | Consulta de empresas con `userId` del usuario ya autenticado                                                              |

---

## Decisiones Técnicas (del plan)

### Backend — Nuevo dominio `Empresas_usuarios`

- **Path:** `packages/server/src/domains/Empresas_usuarios/`
- **Tabla principal:** `Empresas_usuarios` (ya existe en BD)
- **Modelo Sequelize:** `EmpresasUsuariosModel` con `paranoid: true`
- **Asociación:** `EmpresasUsuariosModel.belongsTo(OwnersysModel, { foreignKey: 'id_empresa', as: 'Empresa' })`
  - `OwnersysModel` existe en `packages/server/src/domains/Ownersyss/Infrastructure/Database/Ownersys.model.ts`
- **Use case:** `GetEmpresasByUsuario` — `findAll({ where: { id_usuario: userId }, include: [{ model: OwnersysModel, as: 'Empresa', attributes: ['id', 'razon_social', 'cuit', 'logo'] }] })`
- **Procedimiento tRPC:** `protectedProcedure` con input Zod `{ userId: z.number().int().positive() }`
- **DI (Awilix):** archivo `empresasUsuarios.di.ts`

**Estructura de archivos a crear:**

```
packages/server/src/domains/Empresas_usuarios/
├── Domain/
│   ├── EmpresasUsuarios.entity.ts
│   ├── EmpresasUsuarios.repository.ts
│   ├── EmpresasUsuarios.types.ts
│   └── index.ts
├── Application/
│   ├── EmpresasUsuarios.service.ts
│   ├── empresasUsuarios.types.ts
│   ├── UseCases/
│   │   ├── GetEmpresasByUsuario.usecase.ts
│   │   └── index.ts
│   └── index.ts
├── Infrastructure/
│   ├── Controllers/
│   │   ├── EmpresasUsuarios.controller.ts
│   │   └── index.ts
│   ├── Database/
│   │   ├── EmpresasUsuarios.model.ts
│   │   ├── EmpresasUsuariosRepository.implementation.ts
│   │   └── index.ts
│   ├── Routes/
│   │   ├── EmpresasUsuarios.routes.ts
│   │   ├── Router.ts
│   │   └── index.ts
│   └── index.ts
├── index.ts
└── empresasUsuarios.di.ts
```

**Archivos globales a modificar:**

- `packages/server/src/domains/register.ts` — spread `empresasUsuariosApp`
- `packages/server/src/Infrastructure/Routes/index.ts` — agregar `EmpresasUsuariosRoutes`

### Frontend — Nuevo dominio `EmpresasUsuarios`

- **Path:** `packages/app/src/Domains/EmpresasUsuarios/`
- **Ruta:** `/seleccionar-empresa` (constante `SELECCIONAR_EMPRESA_ROUTE`)
- **Hook:** `useGetEmpresasByUsuario(userId)` — TanStack Query sobre `empresasUsuarios.getByUsuario`
- **Componente:** `EmpresaCard` — recibe `EmpresaItem`, muestra `logo` (o placeholder), `razon_social`, `cuit`
- **Página:** `SeleccionarEmpresa.page.tsx` — lista de `EmpresaCard`, solo visual

**Archivos a crear:**

```
packages/app/src/Domains/EmpresasUsuarios/
├── EmpresasUsuarios.service.ts
├── EmpresasUsuarios.routes.ts
├── EmpresasUsuarios.router.tsx
├── Hooks/
│   ├── useGetEmpresasByUsuario.ts
│   └── index.ts
├── Pages/
│   ├── SeleccionarEmpresa.page.tsx
│   └── index.ts
├── Components/
│   ├── EmpresaCard.tsx
│   └── index.ts
└── index.ts
```

**Archivos globales a modificar:**

- `packages/app/src/Domains/Auth/Hooks/useLoginUser.ts` — en `onSuccess`: consultar empresas y navegar condicionalmente
- `packages/app/src/Domains/index.ts` — agregar export de `EmpresasUsuarios`
- `packages/app/src/Infrastructure/Routes.tsx` — agregar `EmpresasUsuariosRouter`

### Contratos tRPC

```typescript
// specs/multiempresas-usuarios/contracts/empresas-usuarios.contracts.ts
GetEmpresasByUsuarioInputSchema = z.object({
  userId: z.number().int().positive(),
});
EmpresaItemSchema = z.object({
  id: z.number(),
  razon_social: z.string(),
  cuit: z.number(),
  logo: z.string().nullable(),
});
GetEmpresasByUsuarioOutputSchema = z.array(EmpresaItemSchema);
```

---

## Tabla DB — `Empresas_usuarios` (ya existe)

```sql
CREATE TABLE `Empresas_usuarios` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `id_empresa` bigint NOT NULL,   -- FK → Empresas.id (= Sis_propietarios.id)
  `id_usuario` bigint NOT NULL,   -- FK → Usuarios.id
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`,`id_empresa`,`id_usuario`)
)
```

---

## Edge Cases a manejar

- `logo` null → placeholder visual (inicial de `razon_social`)
- Error de BD → no bloquear el flujo de login
- Empresa en `Empresas_usuarios` sin registro en `Sis_propietarios` → ignorar (JOIN interno)
- 0 empresas → flujo normal, sin pantalla de selección

---

## Criterios de Éxito

- SC-001: Pantalla de selección visible en < 2s tras login con ≥ 2 empresas
- SC-002: Usuario mono-empresa no ve pantalla intermedia
- SC-003: 100% de empresas activas se muestran, sin duplicados
- SC-004: Imagen, `razon_social` y `cuit` visibles para todos los registros completos
- SC-005: Datos nunca provienen de tabla `Empresas`

---

## Out of Scope

- Lógica de selección de empresa activa
- Cambios en el JWT post-selección
- Navegación posterior a la selección de empresa
- Mobile responsiveness
