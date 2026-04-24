# Server — MacroGest Core

Este paquete contiene la API de **MacroGest Core**, un sistema B2B multi-tenant construido con **Node.js**, **Express**, **TypeScript** y **tRPC**, siguiendo los principios de **Arquitectura Hexagonal / DDD**. El objetivo es mantener una base escalable, multi-tenant y con separación clara de responsabilidades por dominio.

# Tabla de contenido

1. [Arquitectura Hexagonal](#arquitectura-hexagonal)
2. [Multi-tenancy y RequestContext](#multi-tenancy-y-requestcontext)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Dominios implementados](#dominios-implementados)
5. [Responsabilidades de cada capa](#responsabilidades-de-cada-capa)
6. [Ejemplo aplicado a Users](#ejemplo-aplicado-a-users)
   1. [Domain](#1-dominio-domain)
   2. [Application](#2-aplicación-application)
   3. [Infrastructure](#3-infraestructura-infrastructure)
7. [Inyección de dependencias (Awilix)](#inyección-de-dependencias-awilix)
8. [tRPC: configuración y flujo](#trpc-configuración-y-flujo)
9. [Capa Application global](#capa-application-global)
10. [Tecnologías y libs](#tecnologías-y-libs)

---

# Arquitectura Hexagonal

La **Arquitectura Hexagonal** (también conocida como _Ports & Adapters_) organiza el código de forma que el núcleo de negocio (dominio) quede completamente aislado de los detalles de infraestructura (base de datos, frameworks, transporte HTTP). Su objetivo es que cambios en la infraestructura no afecten la lógica de negocio.

En este proyecto, la arquitectura se aplica en dos niveles:

1. **Nivel global** — carpetas raíz `Application/`, `Infrastructure/`, `utils/` y `domains/`.
2. **Nivel por dominio** — dentro de cada dominio: `Domain/`, `Application/`, `Infrastructure/`.

El principio central es la **dependencia hacia adentro**: las capas externas pueden depender de las internas, pero nunca al revés. Las interfaces definen los contratos; las implementaciones los satisfacen desde afuera.

<img width="952" alt="image" src="https://github.com/user-attachments/assets/c321e2bd-5171-4067-a5f9-da0a825ebb24">

## ¿Cómo quedan vinculadas las capas sin acoplarse?

Mediante **Inyección de Dependencias** (Awilix en modo CLASSIC). Ninguna capa instancia sus dependencias directamente; las recibe como parámetros del constructor, permitiendo sustituir implementaciones sin modificar el núcleo.

![proceso](https://github.com/user-attachments/assets/de5f790d-894a-4312-865d-dd0326260077)

---

# Multi-tenancy y RequestContext

MacroGest Core es una plataforma **multi-tenant**: todos los datos pertenecen a un propietario (`ownerId`). El aislamiento se garantiza en cada query de repositorio.

**Flujo:**

```
JWT token → { id: userId, ownerId } → protectedProcedure → RequestContext → repositorio filtra por ownerId
```

`RequestContext` es una entidad de la capa `Application` global que encapsula los valores de la solicitud actual:

```typescript
class RequestContext {
  get values() {
    return { userId, requestId, ownerId };
  }
}
```

Todo repositorio recibe `requestContext` e incluye `id_propietario = requestContext.values.ownerId` en sus queries. **Nunca se omite este filtro.**

---

# Estructura del proyecto

```
packages/server/src/
├── index.ts                        # Punto de entrada: inicia Express + tRPC
├── Application/                    # Contratos y utilidades globales
│   ├── Adapters/
│   │   ├── ExecuteUseCase.ts       # Adaptador try/catch para ejecutar use cases
│   │   ├── ExecuteService.ts
│   │   ├── TRPCErrorAdapter.ts     # Mapea AppError → TRPCError
│   │   └── TransformToSelect.ts
│   ├── Entities/
│   │   ├── RequestContext.ts       # Contexto multi-tenant por solicitud
│   │   └── AppError.ts             # Error de dominio personalizado
│   ├── Interfaces/
│   │   ├── IUseCase.ts             # Contrato base de todos los Use Cases
│   │   ├── IPagination.ts          # Paginación tipada
│   │   ├── IRequestContext.ts
│   │   ├── IErrorAdapter.ts
│   │   └── ISelect.ts
│   └── Utils/
│       ├── Date.ts
│       ├── LoadImages.ts
│       └── Email/
│           ├── EmailSender.ts      # Envío de emails vía Nodemailer
│           └── EmailsTemplates.ts  # Plantillas HTML de emails
├── Infrastructure/                 # Configuración global de infraestructura
│   ├── Middlewares.ts              # Middlewares Express (CORS, cookies, etc.)
│   ├── Auth/
│   │   └── Auth.ts                 # Middleware de verificación de token
│   ├── Database/
│   │   ├── connection.ts           # Conexión Sequelize a MySQL
│   │   └── relations.ts            # Definición global de asociaciones de modelos
│   ├── Routes/
│   │   └── Router.ts               # Router tRPC principal + exporta TMainRouter
│   ├── di/
│   │   └── register.ts             # Registra todos los dominios en Awilix
│   └── trpc/
│       └── TrpcInstance.ts         # initTRPC, createContext, protectedProcedure
├── domains/                        # Dominios del negocio
│   ├── register.ts                 # Exporta todos los dominios para el DI
│   ├── Auth/
│   ├── Users/
│   ├── Permissions/
│   ├── Themes/
│   ├── Ownersyss/
│   ├── Userprofiles/
│   ├── Companies/
│   └── Profiles/
├── utils/                          # Helpers transversales
│   ├── JWT.ts                      # Firma y verificación de tokens
│   ├── bcrypt.ts                   # Hashing de contraseñas
│   ├── Container.ts                # Contenedor Awilix (CLASSIC mode)
│   ├── pagination.ts               # Helper de paginación
│   ├── pino.ts                     # Configuración del logger
│   ├── format.ts
│   └── Utils.ts
└── types/
    └── express/index.d.ts          # Extensión de tipos de Express
```

---

# Dominios implementados

Cada dominio sigue la estructura `Domain/ → Application/ → Infrastructure/`.

| Dominio          | Descripción                           | Use Cases destacados                                                                                                                                                |
| ---------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**         | Login, restaurar y renovar contraseña | `Login`, `RestorePassword`, `RenewPasswordAuth`, `ValidateUserPassword`                                                                                             |
| **Users**        | CRUD completo de usuarios             | `GetUsers`, `GetUser`, `RegisterUser`, `UpdateUser`, `DeleteUser`, `ChangePassword`, `GetSelectUser`, `GetEmailsByUsersId`, `ValidateUserPassword`, `RenewPassword` |
| **Permissions**  | Roles y permisos por usuario          | `GetRoles`, `GetPermissions`, `GetRoleByUser`, `GetPermissionsByUser`, `AssociateUserToRole`                                                                        |
| **Themes**       | Temas visuales del sistema            | `GetAllThemes`, `GetTheme`                                                                                                                                          |
| **Ownersyss**    | Datos del tenant/propietario          | `GetOwnersys`, `GetOwnerTheme`, `ChangeTheme`                                                                                                                       |
| **Userprofiles** | Asociación usuario–perfil             | `GetAllProfilesByUser`, `AssociateUserToProfile`                                                                                                                    |
| **Companies**    | Modelo de empresa (solo DB)           | —                                                                                                                                                                   |
| **Profiles**     | Modelo de perfil (solo DB)            | —                                                                                                                                                                   |

---

# Responsabilidades de cada capa

## 1. Domain (Dominio)

La capa más interna. **No depende de ninguna otra capa del proyecto.** Contiene:

- **Entidades**: objetos de negocio con sus atributos y comportamiento (`User.entity.ts`).
- **Value Objects**: encapsulan y validan reglas de negocio. Son inmutables y lanzan excepciones si los datos son inválidos (`UserEmail.value.ts`, `UserPassword.value.ts`, etc.).
- **Interfaces de repositorio**: contratos `abstract` que definen los métodos de persistencia sin implementarlos (`User.repository.ts`).

## 2. Application (Aplicación)

Orquesta el negocio. **Depende solo del Domain.** Contiene:

- **Use Cases**: cada uno tiene un único método `execute({ input, requestContext })`. Reciben el repositorio por inyección de dependencias.
- **Service**: recibe los use cases ya instanciados y expone métodos de alto nivel al controlador.

## 3. Infrastructure (Infraestructura)

Detalles de implementación. **Puede depender de Application y Domain.** Contiene:

- **Modelo Sequelize**: define la tabla en MySQL (`Users.model.ts`).
- **Implementación del repositorio**: satisface el contrato de Domain usando Sequelize (`UsersRepository.implementation.ts`). Siempre filtra por `id_propietario`.
- **Controlador tRPC**: valida con Zod y delega al Service.
- **Rutas tRPC**: define las `procedures` y las registra en el Router principal.

---

# Ejemplo aplicado a Users

## 1. Dominio (Domain)

### 1.1 Entidades

Representan los objetos de negocio con solo los atributos que el área de producto necesita. Los constructores instancian los Value Objects correspondientes.

```typescript
// User.entity.ts
export class User {
  private readonly _id: UserId;
  private readonly _name: UserName;
  private readonly _mail: UserEmail;

  constructor(id: number, name: string, mail: string) {
    this._id = new UserId(id);
    this._name = new UserName(name);
    this._mail = new UserEmail(mail);
  }

  get id() {
    return this._id.value;
  }
  get name() {
    return this._name.value;
  }
  get mail() {
    return this._mail.value;
  }
}
```

### 1.2 Value Objects

Encapsulan y validan reglas de negocio. Son inmutables y sin identidad propia. Si el dato no cumple la regla, lanzan `AppError`.

```typescript
// UserEmail.value.ts
export class UserEmail {
  private readonly _value: string;
  constructor(value: string) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      throw new AppError('Email inválido', 400);
    this._value = value;
  }
  get value() {
    return this._value;
  }
}
```

### 1.3 Repositorio (interfaz)

Define el contrato sin implementación. La capa Infrastructure lo satisface.

```typescript
// User.repository.ts
export abstract class UserRepository {
  abstract getAll(requestContext: RequestContext): Promise<User[]>;
  abstract getById(id: number, requestContext: RequestContext): Promise<User>;
  abstract save(user: User, requestContext: RequestContext): Promise<User>;
  abstract update(user: User, requestContext: RequestContext): Promise<User>;
  abstract delete(id: number, requestContext: RequestContext): Promise<void>;
}
```

## 2. Aplicación (Application)

### 2.1 Use Cases

Cada caso de uso tiene un único método `execute`. Recibe el repositorio por DI.

```typescript
// GetUsers.usecase.ts
export class GetUsersUseCase implements IUseCase<User[]> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ requestContext }: { requestContext: RequestContext }) {
    return this.userRepository.getAll(requestContext);
  }
}
```

### 2.2 Service

Orquesta los use cases y usa `executeUseCase` (adaptador global) para manejo uniforme de errores.

```typescript
// Users.service.ts
export class UsersService {
  constructor(
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly registerUserUseCase: RegisterUserUseCase,
  ) {}

  getAll(requestContext: RequestContext) {
    return executeUseCase(this.getUsersUseCase, { requestContext });
  }
}
```

## 3. Infraestructura (Infrastructure)

### 3.1 Modelo Sequelize

Define la tabla y los tipos de columna en MySQL.

```typescript
// Users.model.ts
export const UsersModel = sequelize.define('usuario', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  id_propietario: { type: DataTypes.INTEGER, allowNull: false },
});
```

### 3.2 Implementación del repositorio

Satisface el contrato de `UserRepository`. **Siempre filtra por `ownerId`.**

```typescript
// UsersRepository.implementation.ts
export class UsersRepositoryImplementation extends UserRepository {
  async getAll(requestContext: RequestContext) {
    const users = await UsersModel.findAll({
      where: { id_propietario: requestContext.values.ownerId },
    });
    return users.map((u) => new User(u.id_usuario, u.nombre, u.email));
  }
}
```

### 3.3 Controlador tRPC

Valida con Zod y delega al Service. Usa `protectedProcedure` para requerir autenticación.

```typescript
// Users.controller.ts
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  getAll() {
    return protectedProcedure.query(({ ctx }) =>
      this.usersService.getAll(ctx.requestContext),
    );
  }

  create() {
    return protectedProcedure
      .input(z.object({ nombre: z.string(), email: z.string().email() }))
      .mutation(({ ctx, input }) =>
        this.usersService.register(input, ctx.requestContext),
      );
  }
}
```

### 3.4 Rutas y registro global

Las rutas del dominio se registran en el Router principal, que exporta `TMainRouter` para el frontend:

```typescript
// Infrastructure/Routes/Router.ts
const MainRouter = () =>
  router({
    ...OwnersysRoutes(),
    ...UserRoutes(),
    ...AuthRoutes(),
    ...PermissionsRoutes(),
    ...ThemeRoutes(),
  });

export type TMainRouter = ReturnType<typeof MainRouter>;
```

El tipo `TMainRouter` es importado directamente por la app para inferir todos los tipos de la API sin ningún contrato adicional.

---

# Inyección de dependencias (Awilix)

Awilix en modo **CLASSIC** resuelve las dependencias del constructor en orden posicional. Cada dominio exporta su registro; el DI global los agrupa.

**Flujo:**

```
[dominio].app.ts → domains/register.ts → Infrastructure/di/register.ts → container.register()
```

Ejemplo del dominio Users:

```typescript
// user.app.ts
export const userApp = {
  usersRepositoryImpl: asClass(UsersRepositoryImplementation).singleton(),
  getUsersUseCase: asClass(GetUsersUseCase).singleton(),
  usersService: asClass(UsersService).singleton(),
  usersController: asClass(UsersController).singleton(),
};
```

Awilix inyecta las dependencias por nombre de parámetro del constructor, resolviendo el grafo automáticamente.

---

# tRPC: configuración y flujo

## Procedimiento protegido

`protectedProcedure` es un middleware de tRPC que verifica el JWT y extrae `userId` + `ownerId` del token, inyectándolos en el `RequestContext` para cada solicitud:

```typescript
const protectedProcedure = t.procedure.use(async (opts) => {
  const token = verifyTokenInHeader(ctx.cookies);
  const { id: userId, ownerId } = await verifyToken(token);
  ctx.requestContext.setUserId(userId);
  ctx.requestContext.setOwerId(ownerId);
  return opts.next({ ctx });
});
```

## Error handling

`TRPCErrorAdapter` mapea `AppError` (dominio) a `TRPCError` (infraestructura). El `errorFormatter` devuelve solo `code` y `httpStatus`, sin exponer detalles internos al cliente, protegiendo la información sensible del sistema.

---

# Capa Application global

Contratos y utilidades transversales a todos los dominios:

| Archivo               | Propósito                                                  |
| --------------------- | ---------------------------------------------------------- |
| `IUseCase.ts`         | Interfaz base `execute({ input, requestContext })`         |
| `RequestContext.ts`   | Entidad del contexto multi-tenant por solicitud            |
| `AppError.ts`         | Error de dominio con `message`, `statusCode` y `errorCode` |
| `IPagination.ts`      | Tipos para paginación (`page`, `limit`, `meta`)            |
| `ExecuteUseCase.ts`   | Adaptador try/catch para ejecutar use cases uniformemente  |
| `TRPCErrorAdapter.ts` | Convierte `AppError` en `TRPCError`                        |
| `EmailSender.ts`      | Envío de emails SMTP vía Nodemailer                        |
| `EmailsTemplates.ts`  | Plantillas HTML de emails transaccionales                  |

---

# Tecnologías y libs

| Tecnología        | Versión       | Descripción                             |
| ----------------- | ------------- | --------------------------------------- |
| **Node.js**       | >= 22.6.0     | Runtime de JavaScript en el servidor    |
| **Express**       | ^4.19.2       | Framework HTTP minimalista              |
| **TypeScript**    | ^5.5.2        | Superset tipado de JavaScript           |
| **tRPC**          | 11.0.0-rc.390 | API type-safe sin contratos manuales    |
| **Sequelize**     | ^6.37.3       | ORM para bases de datos relacionales    |
| **MySQL2**        | ^3.11.3       | Driver MySQL de alto rendimiento        |
| **Awilix**        | ^11.0.0       | Contenedor IoC / DI en modo CLASSIC     |
| **Zod**           | ^3.23.8       | Validación de esquemas e inputs         |
| **jsonwebtoken**  | ^9.0.2        | Firma y verificación de JWT             |
| **bcryptjs**      | ^2.4.3        | Hashing seguro de contraseñas           |
| **Pino**          | ^9.4.0        | Logger estructurado de alto rendimiento |
| **pino-http**     | ^10.3.0       | Integración de Pino con Express         |
| **Nodemailer**    | ^8.0.1        | Envío de correos electrónicos           |
| **Multer**        | ^2.0.2        | Carga de archivos multipart/form-data   |
| **Moment.js**     | ^2.30.1       | Manejo y formateo de fechas             |
| **cors**          | ^2.8.5        | Middleware CORS para Express            |
| **cookie-parser** | ^1.4.6        | Parsing de cookies en Express           |
| **uuid**          | ^10.0.0       | Generación de identificadores únicos    |
