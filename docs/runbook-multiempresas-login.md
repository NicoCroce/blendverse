# Runbook: Multiempresa en el login (selección de empresa post-login)

Guía de portabilidad para replicar la experiencia multiempresa en otro proyecto con la misma arquitectura (monorepo pnpm, Express 5 + tRPC v11 + Sequelize v6 + Awilix / React 19 + Vite + TanStack Query, DDD + Hexagonal).

**Implementación de referencia:** rama `main` de GestDoc (dominios `Empresas_usuarios` server + `EmpresasUsuarios` app). Spec original en `specs/multiempresas-usuarios/`.

**Resultado esperado al terminar:** el usuario con 2+ empresas ve la pantalla `/seleccionar-empresa` tras el login; el usuario con 1 empresa no la ve; al seleccionar, la sesión (JWT + cookie) pasa a estar scoped a la empresa elegida; hay un ítem "Cambiar empresa" en el sidebar cuando corresponde.

---

## 1. Requisitos previos del proyecto destino

Verificar que el proyecto ya tiene estos bloques antes de empezar. Si falta alguno, hay que portarlo primero.

### Server

- tRPC v11 con `procedure` (público) y `protectedProcedure` que lea la cookie `auth_token`, verifique el JWT y setee `userId` + `ownerId` en el `RequestContext`. _(Referencia: `packages/server/src/Infrastructure/trpc/TrpcInstance.ts`)_
- `RequestContext` con métodos `setUserId` / `setOwerId` y getter `values`.
- Adaptadores `executeUseCase`, `executeService` y **`executeServiceWithCookie`** (este último setea la cookie desde el campo `token` de la respuesta del servicio). _(Referencia: `packages/server/src/Application/Adapters/ExecuteService.ts`)_
- Utilidades JWT (`generateToken` / `verifyToken`) y cookie (`setAuthCookie`, `AUTH_COOKIE_NAME = 'auth_token'`, HttpOnly, 7 días). _(Referencia: `packages/server/src/Infrastructure/utils/JWT.ts`, `cookie.ts`)_
- Catálogo de empresas: modelo que mapee la tabla de empresas (en GestDoc es `OwnersysModel` → `sis_propietarios`).
- Tabla `usuarios` con columna `id_propietario` (empresa principal). El login la usa para emitir el JWT inicial.
- Dominio de permisos con una procedure tipo `getPermissionByUser` (se usa para decidir la navegación post-login).
- Awilix: `domains/register.ts` (objeto plano de registro) y `Infrastructure/Routes/Router.ts` (objeto `AllRouters`).

### App

- Cliente tRPC React con `credentials: 'include'` en el fetch (la cookie es HttpOnly) y redirect a `/` en 401. _(Referencia: `packages/app/src/Infrastructure/Services/clientApi.ts`)_
- `useGlobalStore(key)` (store global por query key) para guardar `dataUser`. _(Referencia: `packages/app/src/Application/Hooks/useGlobalStore.ts`)_
- Primitivos UI: `Container`, `Title`, `Button`, `MenuItem` (sidebar) y `HalfPage` + `LeftContentPage` (o equivalente de layout de login).
- Tipo `TUserLogged` inferido del router de login que incluya `ownerId`, `companyName`, `companyLogo`. Si el login del destino no los devuelve, hay que enriquecer el `validateUser` del dominio Users (ver sección 4, paso previo).
- Constantes de navegación equivalentes a `DASHBOARD_ACCESS`, `DOCUMENTS_ROUTE`, `DOCUMENTS_DASHBOARD`.

---

## 2. Base de datos

### Crear la tabla `empresas_usuarios`

```sql
CREATE TABLE `empresas_usuarios` (
  `id`          BIGINT NOT NULL AUTO_INCREMENT,
  `id_empresa`  BIGINT NOT NULL,
  `id_usuario`  BIGINT NOT NULL,
  `createdAt`   DATETIME DEFAULT NULL,
  `updatedAt`   DATETIME DEFAULT NULL,
  `deletedAt`   DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_empresas_usuarios_usuario` (`id_usuario`),
  KEY `idx_empresas_usuarios_empresa` (`id_empresa`),
  CONSTRAINT `fk_empresas_usuarios_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `sis_propietarios` (`id`),
  CONSTRAINT `fk_empresas_usuarios_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

En GestDoc la tabla se creó a mano (no existe infraestructura de migraciones en el repo; solo `001_disclaimer.sql`). En el destino, crearla por el mecanismo de migración del proyecto.

### Reglas de datos

- **Sin `id_propietario` en la tabla intermedia.** El aislamiento multi-tenant sale de la relación `id_empresa`.
- Soft-delete: `deletedAt` no nulo = inactivo (el modelo usa `paranoid: true`).
- La empresa "principal" del usuario NO se guarda acá; sigue siendo `usuarios.id_propietario` y solo determina el JWT inicial del login.

### Datos de prueba

Para probar ambos flujos se necesita un usuario con **1 empresa** y otro con **2+ registros** en `empresas_usuarios` (usar `ids` de `sis_propietarios` y `usuarios` reales del destino).

---

## 3. Backend — archivos a crear

Copiar el dominio `packages/server/src/domains/Empresas_usuarios/` de GestDoc, adaptando los renombres de la sección 5.

| Archivo destino                                                                                  | Rol                                                                                              |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `domains/Empresas_usuarios/Domain/EmpresasUsuarios.entity.ts`                                    | Entidad `EmpresaUsuario` (`static create`, getter `values`)                                      |
| `domains/Empresas_usuarios/Domain/EmpresasUsuarios.repository.ts`                                | Puerto: `findByUsuario(userId)` + `belongsToEmpresa(userId, empresaId)`                          |
| `domains/Empresas_usuarios/Domain/EmpresasUsuarios.types.ts`                                     | Tipo `IEmpresaUsuario`                                                                           |
| `domains/Empresas_usuarios/Domain/index.ts`                                                      | Barrel                                                                                           |
| `domains/Empresas_usuarios/Application/UseCases/GetEmpresasByUsuario.usecase.ts`                 | Lista `{id, denominacion, logo}` del usuario                                                     |
| `domains/Empresas_usuarios/Application/UseCases/SelectEmpresa.usecase.ts`                        | Verifica pertenencia + **regenera JWT con nuevo `ownerId`**                                      |
| `domains/Empresas_usuarios/Application/UseCases/index.ts`                                        | Barrel                                                                                           |
| `domains/Empresas_usuarios/Application/EmpresasUsuarios.service.ts`                              | Orquesta los use cases                                                                           |
| `domains/Empresas_usuarios/Application/empresasUsuarios.types.ts`                                | Schemas Zod + `z.infer` (`GetEmpresasByUsuarioInputSchema`, `SelectEmpresaInputSchema`, outputs) |
| `domains/Empresas_usuarios/Application/index.ts`                                                 | Barrel                                                                                           |
| `domains/Empresas_usuarios/Infrastructure/Database/EmpresasUsuarios.model.ts`                    | Modelo Sequelize + `belongsTo(OwnersysModel, { foreignKey: 'id_empresa', as: 'Empresa' })`       |
| `domains/Empresas_usuarios/Infrastructure/Database/EmpresasUsuariosRepository.implementation.ts` | `findAll` con `include` de la empresa (denominacion + logo); `count` para `belongsToEmpresa`     |
| `domains/Empresas_usuarios/Infrastructure/Database/index.ts`                                     | Barrel                                                                                           |
| `domains/Empresas_usuarios/Infrastructure/Controllers/EmpresasUsuarios.controller.ts`            | `getByUsuario` (query) + `selectEmpresa` (mutation con `executeServiceWithCookie`)               |
| `domains/Empresas_usuarios/Infrastructure/Controllers/index.ts`                                  | Barrel                                                                                           |
| `domains/Empresas_usuarios/Infrastructure/Routes/EmpresasUsuarios.routes.ts`                     | Router tRPC: `{ empresasUsuarios: { getByUsuario, selectEmpresa } }`                             |
| `domains/Empresas_usuarios/Infrastructure/Routes/Router.ts`                                      | Exporta `EmpresasUsuariosRoutes`                                                                 |
| `domains/Empresas_usuarios/Infrastructure/Routes/index.ts`                                       | Barrel                                                                                           |
| `domains/Empresas_usuarios/Infrastructure/index.ts`                                              | Barrel                                                                                           |
| `domains/Empresas_usuarios/empresasUsuarios.di.ts`                                               | Registro Awilix (repo, service, controller, `_getEmpresasByUsuario`, `_selectEmpresa`)           |
| `domains/Empresas_usuarios/index.ts`                                                             | Barrel público                                                                                   |

### Piezas críticas del backend (no olvidar)

**1. Regeneración de token al seleccionar empresa** — `SelectEmpresa.usecase.ts`:

```typescript
const belongs = await this.empresasUsuariosRepository.belongsToEmpresa(
  userId,
  empresaId,
);
if (!belongs) throw new Error('No tenés acceso a esta empresa');
const token = generateToken({ id: userId, ownerId: empresaId });
return { token, ownerId: empresaId };
```

**2. La mutation DEBE usar `executeServiceWithCookie`** — `EmpresasUsuarios.controller.ts`:

```typescript
selectEmpresa = () =>
  protectedProcedure
    .input(SelectEmpresaInputSchema)
    .mutation(
      executeServiceWithCookie(
        this.empresasUsuariosService.selectEmpresa.bind(
          this.empresasUsuariosService,
        ),
      ),
    );
```

Esto setea la cookie `auth_token` con el JWT nuevo y devuelve solo `{ ownerId }`.

**3. Eager-load de la empresa** — `EmpresasUsuariosRepository.implementation.ts`:

```typescript
const rows = await EmpresasUsuariosModel.findAll({
  where: { id_usuario: userId },
  include: [
    {
      model: OwnersysModel,
      as: 'Empresa',
      attributes: ['id', 'denominacion', 'logo'],
    },
  ],
});
```

El modelo de la empresa debe estar registrado con la asociación `belongsTo` en `EmpresasUsuarios.model.ts` (ver sección 1, "catálogo de empresas").

### Paso previo si el login del destino no expone la empresa

El JWT inicial y `TUserLogged` dependen de que `ValidateUserPassword` devuelva `ownerId`, `companyName`, `companyLogo`. Verificar el método `validateUser` del repositorio de Users: debe hacer `include` del modelo de empresa (en GestDoc: `CompaniesModel`, misma tabla `sis_propietarios`) y construir el `User` con esos 3 campos. Si no los tiene, agregarlos antes de portar el resto.

---

## 4. Backend — archivos a modificar

| Archivo                           | Cambio                                                                                             |
| --------------------------------- | -------------------------------------------------------------------------------------------------- |
| `domains/register.ts`             | Importar `empresasUsuariosApp` desde `./Empresas_usuarios` y hacer spread en el objeto de registro |
| `Infrastructure/Routes/Router.ts` | Importar `EmpresasUsuariosRoutes` y agregar `...EmpresasUsuariosRoutes()` al objeto `AllRouters`   |

Ejemplo del registro DI (respetar claves con prefijo `_` para use cases, sin colisiones):

```typescript
export const empresasUsuariosApp = {
  empresasUsuariosRepository: asClass(EmpresasUsuariosRepositoryImplementation),
  empresasUsuariosService: asClass(EmpresasUsuariosService),
  empresasUsuariosController: asClass(EmpresasUsuariosController),
  _getEmpresasByUsuario: asClass(GetEmpresasByUsuario),
  _selectEmpresa: asClass(SelectEmpresa),
};
```

---

## 5. Renombres y adaptaciones por proyecto

| En GestDoc                                  | En el destino                                              | Dónde                                                                    |
| ------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| `Empresas_usuarios` / `EmpresasUsuarios`    | Nombre del dominio/tabla del destino (ej. `CompanyUsers`)  | Tabla, carpetas, modelos, clases, DI keys, router tRPC, barrel de la app |
| `sis_propietarios` / `OwnersysModel`        | Tabla catálogo de empresas del destino                     | `EmpresasUsuarios.model.ts`, repo impl                                   |
| `usuarios` / `UserModel` (`id_propietario`) | Tabla de usuarios del destino                              | Login / `validateUser`                                                   |
| `denominacion` / `logo`                     | Columnas equivalentes de la empresa (razón social, imagen) | Repo impl, `empresasUsuarios.types.ts`, `EmpresaCard`                    |
| `getPermissionByUser` + `DASHBOARD_ACCESS`  | Procedure/constante de permisos del destino                | `useLoginUser.ts`, `useSelectEmpresa.ts`                                 |
| `DOCUMENTS_ROUTE` / `DOCUMENTS_DASHBOARD`   | Rutas post-login del destino                               | `useLoginUser.ts`, `useSelectEmpresa.ts`                                 |
| `faExchangeAlt`                             | Ícono de "cambiar empresa"                                 | `MenuEmpresasUsuarios.tsx`                                               |

**Convenciones a respetar (no adaptar):** `protectedProcedure` para ambas procedures (la consulta y la selección requieren sesión), schemas Zod como fuente de verdad con `z.infer`, claves DI `_[camelCase]`, separación de capas DDD, specs colocalizadas en carpetas `specs/` por capa.

---

## 6. Frontend — archivos a crear

Copiar el dominio `packages/app/src/Domains/EmpresasUsuarios/` de GestDoc.

| Archivo destino                                              | Rol                                                                                                                               |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `Domains/EmpresasUsuarios/EmpresasUsuarios.routes.ts`        | `SELECCIONAR_EMPRESA_ROUTE = '/seleccionar-empresa'`                                                                              |
| `Domains/EmpresasUsuarios/EmpresasUsuarios.service.ts`       | `createTRPCReact<TEmpresasUsuariosRouter>()` + `export const EmpresasUsuariosService = _empresasUsuariosService.empresasUsuarios` |
| `Domains/EmpresasUsuarios/Hooks/useGetEmpresasByUsuario.ts`  | `EmpresasUsuariosService.getByUsuario.useQuery({ userId })`                                                                       |
| `Domains/EmpresasUsuarios/Hooks/useSelectEmpresa.ts`         | Mutation: actualiza store global, navega por permisos                                                                             |
| `Domains/EmpresasUsuarios/Hooks/index.ts`                    | Barrel                                                                                                                            |
| `Domains/EmpresasUsuarios/Components/EmpresaCard.tsx`        | Card con logo + fallback a inicial                                                                                                |
| `Domains/EmpresasUsuarios/Components/index.ts`               | Barrel                                                                                                                            |
| `Domains/EmpresasUsuarios/Pages/SeleccionarEmpresa.page.tsx` | Grid de `EmpresaCard` + layout de login                                                                                           |
| `Domains/EmpresasUsuarios/Pages/index.ts`                    | Barrel                                                                                                                            |
| `Domains/EmpresasUsuarios/EmpresasUsuarios.router.tsx`       | `<Route path={SELECCIONAR_EMPRESA_ROUTE}>`                                                                                        |
| `Domains/EmpresasUsuarios/MenuEmpresasUsuarios.tsx`          | ítem "Cambiar empresa" si hay >1 empresa                                                                                          |
| `Domains/EmpresasUsuarios/index.ts`                          | Barrel                                                                                                                            |

### Piezas críticas del frontend

**1. Navegación condicional post-login** — modificar `Auth/Hooks/useLoginUser.ts`, `onSuccess`:

```typescript
const [empresas, permissions] = await Promise.all([
  utils.empresasUsuarios.getByUsuario.fetch({ userId: data.id ?? 0 }),
  utils.permissions.getPermissionByUser.fetch(),
]);
if ((empresas ?? []).length >= 2) navigate(SELECCIONAR_EMPRESA_ROUTE);
else if ((permissions ?? []).includes(DASHBOARD_ACCESS))
  navigate(DOCUMENTS_DASHBOARD);
else navigate(DOCUMENTS_ROUTE);
```

**2. Al seleccionar, refrescar el store global con la empresa elegida** — `Hooks/useSelectEmpresa.ts` (`onSuccess`):

```typescript
setQueryData((prev) => ({
  ...prev!,
  ownerId: data.ownerId,
  companyName: /* nombre de la card seleccionada */,
  companyLogo: /* logo de la card seleccionada */,
}));
```

El nombre/logo no vienen del server en la respuesta de `selectEmpresa` (solo `{ ownerId }`), por eso la página los pasa junto al `empresaId` y el hook los guarda en un ref antes de mutar.

**3. Fallback de logo** — `Components/EmpresaCard.tsx`: si `logo === null` o falla el `onError` del `<img>`, renderizar la inicial de la denominación.

**4. Ítem de menú condicional** — `MenuEmpresasUsuarios.tsx`:

```typescript
const hasMultipleEmpresas = empresas && empresas.length > 1;
if (!hasMultipleEmpresas) return null;
```

---

## 7. Frontend — archivos a modificar

| Archivo                                    | Cambio                                                                                          |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `Domains/Auth/Hooks/useLoginUser.ts`       | Agregar el fetch de `getByUsuario` + navegación condicional (sección 6, pieza 1)                |
| `Infrastructure/Routes.tsx`                | Importar `EmpresasUsuariosRouter` y agregarlo al array `AllRoutes`                              |
| `Infrastructure/Services/clientApi.ts`     | Verificar `credentials: 'include'` + redirect 401 a `/` (requisito previo)                      |
| `Domains/Auth/Auth.service.ts` (si aplica) | Asegurar que el service de permisos esté exportado para `utils.permissions.getPermissionByUser` |

---

## 8. Tests

Referencias en GestDoc (adaptar nombres):

- **App:** `packages/app/src/Domains/EmpresasUsuarios/Hooks/specs/useSelectEmpresa.spec.tsx`, `packages/app/src/Domains/EmpresasUsuarios/Components/__tests__/EmpresaCard.test.tsx`, `packages/app/src/Domains/Auth/Hooks/specs/useLoginUser.spec.tsx` (mock de `getByUsuario` con 1 vs 2+ empresas).
- **Server:** en GestDoc el dominio `Empresas_usuarios` no tiene specs de servidor; el patrón a seguir es el de otros dominios (`Application/UseCases/specs/*.usecase.spec.ts`, `Infrastructure/Controllers/specs/*.controller.spec.ts`).

Tests mínimos a escribir en el destino:

1. `GetEmpresasByUsuario`: usuario con N empresas → N items; usuario sin empresas → lista vacía.
2. `SelectEmpresa`: usuario NO perteneciente → error; perteneciente → token nuevo con `ownerId` = empresa elegida.
3. `useLoginUser`: `getByUsuario` retorna 2+ → `navigate(SELECCIONAR_EMPRESA_ROUTE)`; retorna 1 → NO navega a esa ruta.
4. `EmpresaCard`: con logo, sin logo (fallback), logo roto (`onError`).

---

## 9. Checklist de verificación

Ejecutar al final, en orden:

1. `pnpm --filter server tsc --noEmit` → 0 errores.
2. `pnpm --filter app tsc --noEmit` → 0 errores.
3. `pnpm lint` (o equivalente del proyecto).
4. Tests de los dominios tocados (server + app).
5. **Manual — usuario con 1 empresa:** login → entra directo a la app, sin pantalla de selección.
6. **Manual — usuario con 2+ empresas:** login → `/seleccionar-empresa` con una card por empresa; seleccionar → entra a la app; recargar la página no pierde la sesión (cookie nueva con el `ownerId` elegido).
7. **Manual — cambio de empresa:** el ítem "Cambiar empresa" aparece solo con 2+ empresas y vuelve a la pantalla de selección.
8. **Manual — datos multi-tenant:** tras elegir empresa B, los listados filtran por `ownerId = B` (verificar en un listado real del dominio).
9. **Manual — sesión vencida:** borrar la cookie → próximo request → redirect a `/`.

---

## 10. Resumen de la experiencia (para el equipo)

El flujo completo, de extremo a extremo:

1. **Login** (público) valida credenciales y emite JWT `{ id, user, ownerId }` con la **empresa principal** del usuario (`usuarios.id_propietario`); se guarda en cookie HttpOnly `auth_token`.
2. **El frontend** consulta `empresasUsuarios.getByUsuario(userId)` (N:N `empresas_usuarios` → `sis_propietarios`).
3. **Si hay 2+ empresas** → navega a `/seleccionar-empresa` (grid de cards con logo/razón social).
4. **Al seleccionar**, `selectEmpresa` verifica pertenencia y **re-emite el JWT** con `ownerId = empresa elegida` vía `executeServiceWithCookie`; el frontend actualiza `dataUser` en el store global.
5. **De ahí en adelante**, todas las queries van con el `ownerId` de la cookie, lo que aísla los datos multi-tenant.
