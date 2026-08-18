# Plan Técnico — Feature: `multiempresas-usuarios`

**Branch:** `feat/multiempresas-usuarios`
**Spec:** `specs/multiempresas-usuarios/spec.md`
**Estado:** Listo para implementación

---

## Overview Técnico

La feature agrega soporte multi-empresa al flujo post-login:

1. **Backend** — Nuevo dominio DDD `Empresas_usuarios` que expone un procedimiento tRPC `getEmpresasByUsuario`. Recibe un `userId`, consulta `Empresas_usuarios` con eager-load de `Sis_propietarios` y devuelve la lista de empresas con `id`, `razon_social`, `cuit` y `logo`.
2. **Frontend** — Nuevo dominio React `EmpresasUsuarios` con hook `useGetEmpresasByUsuario`, página `/seleccionar-empresa` y modificación del hook `useLoginUser` para redirigir condicionalmente.

---

## Fases de Implementación

### Fase 1 — Backend: Dominio `Empresas_usuarios`

**Objetivo:** Crear el dominio DDD completo y exponer el procedimiento tRPC.

**Archivos a crear:**

```
packages/server/src/domains/Empresas_usuarios/
├── Domain/
│   ├── EmpresasUsuarios.entity.ts        # Entidad EmpresaUsuario con id, razon_social, cuit, logo
│   ├── EmpresasUsuarios.repository.ts    # Interface IEmpresasUsuariosRepository
│   ├── EmpresasUsuarios.types.ts         # Tipos del dominio (IEmpresaUsuario)
│   └── index.ts                          # Barrel: re-exports de Domain/
├── Application/
│   ├── EmpresasUsuarios.service.ts       # Servicio: orquesta el use case
│   ├── empresasUsuarios.types.ts         # Tipos Application (IGetEmpresasByUsuario extends IRequestContext)
│   ├── UseCases/
│   │   ├── GetEmpresasByUsuario.usecase.ts  # Lógica: findAll con include Empresa
│   │   └── index.ts                        # Barrel de UseCases
│   └── index.ts                            # Barrel: re-exports de Application/
├── Infrastructure/
│   ├── Controllers/
│   │   ├── EmpresasUsuarios.controller.ts  # protectedProcedure + input Zod + executeService
│   │   └── index.ts
│   ├── Database/
│   │   ├── EmpresasUsuarios.model.ts       # Modelo Sequelize tabla Empresas_usuarios
│   │   ├── EmpresasUsuariosRepository.implementation.ts  # findAll con belongsTo + include
│   │   └── index.ts
│   ├── Routes/
│   │   ├── EmpresasUsuarios.routes.ts      # { empresasUsuarios: { getByUsuario: ... } }
│   │   ├── Router.ts
│   │   └── index.ts
│   └── index.ts
├── index.ts                                # Barrel global del dominio
└── empresasUsuarios.di.ts                  # Awilix: asClass para repo, service, controller, use case
```

**Archivos a modificar:**

| Archivo                                              | Cambio                                                      |
| ---------------------------------------------------- | ----------------------------------------------------------- |
| `packages/server/src/domains/register.ts`            | Importar y spread `empresasUsuariosApp`                     |
| `packages/server/src/Infrastructure/Routes/index.ts` | Importar `EmpresasUsuariosRoutes` y agregar al `AllRouters` |

---

### Fase 2 — Frontend: Dominio `EmpresasUsuarios`

**Prerrequisito:** Fase 1 completada (el tipo `TEmpresasUsuariosRouter` debe existir en el server).

**Objetivo:** Pantalla de selección de empresa y modificación del flujo post-login.

**Archivos a crear:**

```
packages/app/src/Domains/EmpresasUsuarios/
├── EmpresasUsuarios.service.ts           # createTRPCReact<TEmpresasUsuariosRouter>
├── EmpresasUsuarios.routes.ts            # SELECCIONAR_EMPRESA_ROUTE = '/seleccionar-empresa'
├── EmpresasUsuarios.router.tsx           # <Route path={SELECCIONAR_EMPRESA_ROUTE} element={...} />
├── Hooks/
│   ├── useGetEmpresasByUsuario.ts        # TanStack Query sobre empresasUsuarios.getByUsuario
│   └── index.ts
├── Pages/
│   ├── SeleccionarEmpresa.page.tsx       # Lista visual de empresas (botones sin acción)
│   └── index.ts
├── Components/
│   ├── EmpresaCard.tsx                   # Card/botón individual: logo + razon_social + cuit
│   └── index.ts
└── index.ts                              # Barrel: re-exports públicos del dominio
```

**Archivos a modificar:**

| Archivo                                               | Cambio                                                          |
| ----------------------------------------------------- | --------------------------------------------------------------- |
| `packages/app/src/Domains/Auth/Hooks/useLoginUser.ts` | Tras `onSuccess`, consultar empresas y navegar condicionalmente |
| `packages/app/src/Domains/index.ts`                   | Agregar `export * from './EmpresasUsuarios'`                    |
| `packages/app/src/Infrastructure/Routes.tsx`          | Importar `EmpresasUsuariosRouter` y agregarlo a `AllRoutes`     |

---

### Fase 3 — Integración y Validación

**Objetivo:** Verificar el flujo end-to-end: login → consulta de empresas → navegación condicional.

**Acciones:**

1. `pnpm tsc --noEmit` en ambos paquetes — 0 errores
2. `pnpm vitest run` — tests del nuevo dominio y tests modificados de Auth pasan
3. Verificación manual o con Playwright del flujo: login con usuario multi-empresa → `/seleccionar-empresa`; login con usuario mono-empresa → flujo normal

---

## Patrones a Seguir

### Backend — Arquitectura Hexagonal / DDD

- **Entidad** en `Domain/` con `static create()` y getter `values` — sin dependencias externas
- **Repositorio** en `Domain/` como interfaz pura (`interface IRepo`)
- **Casos de Uso** en `Application/UseCases/` implementando `IUseCase<T>` de `@server/Application`
- **Servicio** en `Application/` que delega a use cases vía `executeUseCase`
- **Controlador** en `Infrastructure/Controllers/` usando `protectedProcedure` + `z.object()` + `executeService`
- **Modelo Sequelize** en `Infrastructure/Database/` — solo para ORM; nunca en capas superiores
- **Implementación de repositorio** en `Infrastructure/Database/` — traduce rows a entidades de dominio
- **Ruta tRPC** en `Infrastructure/Routes/` — importa el controller resuelto del DI
- **DI Awilix** en `[domain].di.ts` — `asClass(...)` para todos los componentes del dominio
- **Barrel `index.ts`** en la raíz del dominio — solo re-exports, sin lógica

### Frontend — Estructura de Dominio React

- **Service** (`[Domain].service.ts`): `createTRPCReact<TRouter>()` + export del namespace tRPC
- **Routes** (`[Domain].routes.ts`): constantes de rutas como `export const ROUTE = '/...'`
- **Router** (`[Domain].router.tsx`): array de `<Route>` JSX elements
- **Hooks** (`Hooks/use*.ts`): TanStack Query — `useQuery` para lecturas, `useMutation` para escrituras; sin lógica de negocio
- **Pages** (`Pages/*.page.tsx`): componentes de página livianos — consumen hooks, delegan render a Components
- **Components** (`Components/*.tsx`): presentacionales — reciben props, sin llamadas directas a servicios

### Multi-tenant

- El filtro multi-tenant para `Empresas_usuarios` se realiza via `id_empresa` (campo de la tabla de unión). No existe `id_propietario` en esa tabla.
- El `requestContext.values.ownerId` **no se usa** como filtro en este dominio — el filtro es por `id_usuario`.

### Asociación Sequelize

- `EmpresasUsuariosModel.belongsTo(OwnersysModel, { foreignKey: 'id_empresa', as: 'Empresa' })`
- La asociación se inicializa en `EmpresasUsuariosRepository.implementation.ts` antes del primer uso
- En el `findAll`: `include: [{ model: OwnersysModel, as: 'Empresa', attributes: ['id', 'razon_social', 'cuit', 'logo'] }]`

### Modificación del flujo de login (frontend)

```typescript
// useLoginUser.ts — lógica de navegación condicional
onSuccess: async (data) => {
  setLogged();
  setQueryData(data);
  // Consultar empresas usando el userId del usuario recién autenticado
  const empresas = await getEmpresasByUsuario({ userId: data.user.values.id });
  if (empresas.length >= 2) {
    navigate(SELECCIONAR_EMPRESA_ROUTE);
  } else {
    navigate(DOCUMENTS_ROUTE);
  }
},
```

> La consulta de empresas en el hook de login debe ser una llamada directa al cliente tRPC (no `useQuery`), ya que se ejecuta dentro de `onSuccess` de una mutación.

---

## Dependencias entre Fases

```
Fase 1 (Backend)
  └─► Fase 2 (Frontend)   ← requiere TRouter del server compilado
        └─► Fase 3 (Integración)
```

La Fase 2 depende de que el tipo `TEmpresasUsuariosRouter` esté exportado desde el server para que el servicio tRPC del frontend esté correctamente tipado.

---

## Contrato tRPC

**Procedimiento:** `empresasUsuarios.getByUsuario`
**Tipo:** `query` (protectedProcedure)
**Input:** `{ userId: number }` — validado con Zod
**Output:** `Array<{ id, razon_social, cuit, logo }>` — ver contrato completo en `contracts/empresas-usuarios.contracts.ts`

---

## Quickstart de Validación

Ver `specs/multiempresas-usuarios/quickstart.md`.

---

## Referencias

- Contrato: `specs/multiempresas-usuarios/contracts/empresas-usuarios.contracts.ts`
- Data model: `specs/multiempresas-usuarios/data-model.md`
- Spec: `specs/multiempresas-usuarios/spec.md`
- Patrón de referencia (dominio completo): `packages/server/src/domains/Ownersyss/`
- Patrón de referencia (frontend): `packages/app/src/Domains/Auth/`
