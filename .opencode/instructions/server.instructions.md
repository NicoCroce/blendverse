---
description: Convenciones de arquitectura Hexagonal/DDD para el paquete `packages/server`. Se aplica automáticamente en cualquier tarea dentro de esa carpeta.
applyTo: 'packages/server/**'
---

# Backend — Arquitectura Hexagonal (DDD)

## Estructura de un Dominio

```
packages/server/src/domains/[Domain]/
├── Domain/
│   ├── [Entity].entity.ts                    # Entidad de dominio
│   ├── [Entity].repository.ts                # Puerto abstracto de repositorio
│   └── index.ts                              # Barrel export de la capa
├── Application/
│   ├── UseCases/
│   │   ├── [Action][Entity].usecase.ts       # Implementa IUseCase<TOutput>
│   │   └── index.ts
│   ├── [domain].types.ts                     # z.infer<> schemas + tipos Input/Output
│   ├── [Domain].service.ts                   # Orquesta casos de uso
│   └── index.ts
├── Infrastructure/
│   ├── Controllers/
│   │   ├── [Domain].controller.ts            # tRPC procedures + Zod
│   │   └── index.ts
│   ├── Database/
│   │   ├── [Entity].model.ts                 # Modelo Sequelize
│   │   ├── [Entity]Repository.implementation.ts
│   │   └── index.ts
│   ├── Routes/
│   │   ├── [Domain].routes.ts                # Exporta el tRPC router del dominio
│   │   └── index.ts
│   └── index.ts
├── [domain].di.ts                           # Registro Awilix del dominio
└── index.ts                                  # Barrel export público
```

## Estructura de Specs

Todos los archivos de test (`.spec.ts`, `.test.ts`) deben organizarse en una carpeta `specs/` manteniendo la misma estructura del directorio padre.

✅ **CORRECTO:**

```
packages/server/src/domains/Articles/
├── Domain/
│   ├── Article.entity.ts
│   └── specs/
│       └── Article.entity.spec.ts
├── Application/
│   ├── UseCases/
│   │   ├── CreateArticle.usecase.ts
│   │   └── specs/
│   │       └── CreateArticle.usecase.spec.ts
│   └── [domain].types.ts
└── Infrastructure/
    ├── Controllers/
    │   ├── Article.controller.ts
    │   └── specs/
    │       └── Article.controller.spec.ts
    └── Database/
        ├── Article.model.ts
        └── specs/
            └── Article.model.spec.ts
```

❌ **PROHIBIDO** — Mezclar specs con archivos fuente:

```
Domain/
├── Article.entity.ts
├── Article.entity.spec.ts      # ← INCORRECTO
```

## Domain Layer

### Entidad

```typescript
export class Entity {
  constructor(
    protected readonly _field1: string,
    protected readonly _field2: number,
    protected readonly _id?: number,
  ) {}

  static create({ id, field1, field2 }: IEntity): Entity {
    return new Entity(field1, field2, id);
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return { id: this._id, field1: this._field1, field2: this._field2 };
  }
}
```

### Repositorio Abstracto (Puerto)

```typescript
export interface EntityRepository {
  getAllEntities(
    params: IGetEntitiesRepository,
  ): Promise<IGetEntitiesRepositoryResponse>;
  createEntity(params: ICreateEntityRepository): Promise<Entity>;
  getEntity(params: IGetEntityRepository): Promise<Entity | null>;
  updateEntity(params: IUpdateEntityRepository): Promise<Entity>;
  deleteEntity(params: IDeleteEntityRepository): Promise<number>;
}
```

### Interfaces con Members

Las interfaces en la capa Domain **nunca deben estar vacías** ni ser equivalentes a su supertype. Siempre deben declarar al menos un member propio.

❌ **PROHIBIDO** — Interface vacía:

```typescript
export interface IGetUserRepository extends IRequestContext {
  // vacía = error
}
```

✅ **CORRECTO** — Interface con members:

```typescript
export interface IGetUserRepository extends IRequestContext {
  id: number;
}
```

**Razonamiento:** Una interface que solo hereda no suma información de tipos. Si no tienes properties propias que agregar, no necesitás una interface separada — usá directamente el tipo heredado en el parámetro.

## Application Layer

### Types (`[domain].types.ts`)

Usa `z.infer<typeof Schema>` como fuente de verdad. **No definas interfaces manualmente** si ya existe un Zod schema en el controller — derivá el tipo de él para eliminar redundancia.

```typescript
import { IRequestContext, IPagination } from '@server/Application';
import z from 'zod';

// Schemas (fuente de verdad)
export const GetAllEntitiesSchema = z
  .object({ search: z.string().optional() })
  .merge(
    z.object({ page: z.number().optional(), limit: z.number().optional() }),
  )
  .optional();

export const CreateEntitySchema = z.object({
  field1: z.string().min(1),
  field2: z.number(),
});

export const UpdateEntitySchema = z.object({
  id: z.number(),
  field1: z.string().min(1),
});

// Tipos inferidos — nunca duplicar a mano
export type IGetAllEntities = IRequestContext & {
  input?: z.infer<typeof GetAllEntitiesSchema>;
};
export type ICreateEntity = IRequestContext & {
  input: z.infer<typeof CreateEntitySchema>;
};
export type IGetEntity = IRequestContext & { input: number };
export type IUpdateEntity = IRequestContext & {
  input: z.infer<typeof UpdateEntitySchema>;
};
export type IDeleteEntity = IRequestContext & { input: number };
```

> **Regla:** Si el tipo de `input` es primitivo (`number`, `string`) se declara inline. Si es un objeto, siempre existe un Zod schema del cual derivar.

### Use Case

```typescript
import { AppError, IUseCase } from '@server/Application';
import { EntityRepository } from '../../Domain/Entity.repository';
import { ICreateEntity } from '../[domain].types';

export class CreateEntity implements IUseCase<Entity> {
  constructor(private readonly entityRepository: EntityRepository) {}

  async execute({ input, requestContext }: ICreateEntity): Promise<Entity> {
    const entity = Entity.create({ ...input });
    return this.entityRepository.createEntity({ entity, requestContext });
  }
}
```

### Service

```typescript
export class EntityService {
  constructor(
    private readonly _createEntity: CreateEntity,
    private readonly _getAllEntities: GetAllEntities,
  ) {}

  async createEntity({ input, requestContext }: ICreateEntity) {
    return executeUseCase({
      useCase: this._createEntity,
      input,
      requestContext,
    });
  }
}
```

## Infrastructure Layer

### Controller (tRPC)

```typescript
import { protectedProcedure } from '@server/Infrastructure';
import { executeService } from '@server/Application';
import z from 'zod';

export class EntityController {
  constructor(private entityService: EntityService) {}

  getAll = () =>
    protectedProcedure
      .input(z.object({ search: z.string().default('') }).optional())
      .query(
        executeService(
          this.entityService.getAllEntities.bind(this.entityService),
        ),
      );

  create = () =>
    protectedProcedure
      .input(z.object({ field1: z.string().min(1), field2: z.number() }))
      .mutation(
        executeService(
          this.entityService.createEntity.bind(this.entityService),
        ),
      );
}
```

### Secuencia de llamada

`Controller → Service → executeUseCase → UseCase → Repository → Sequelize Model`

### Utilidades compartidas (`Infrastructure/utils/`)

Las funciones puras que **no usan el modelo Sequelize** (helpers de fechas, nombres, formateo, mapeo de datos) **no viven en los repositorios**. Van en `packages/server/src/Infrastructure/utils/` y se exportan desde `@server/Infrastructure` (barrel `Infrastructure/index.ts`).

✅ **CORRECTO:**

```typescript
// packages/server/src/Infrastructure/utils/dateUtils.ts
export const formatDate = (date: Date): string => { ... };
export const startOfToday = (): Date => { ... };

// Uso en el repositorio
import { formatDate, startOfToday } from '@server/Infrastructure';
```

❌ **PROHIBIDO** — Helpers privados estáticos dentro del repositorio:

```typescript
export class CertificatesRepositoryImplementation implements CertificateRepository {
  // ← INCORRECTO: función pura sin Sequelize, debe ir en Infrastructure/utils/
  private static formatDate(date: Date): string { ... }
}
```

**Reglas:**

- Si un helper se repite en 2+ repositorios o es una utilidad genérica (fechas, nombres, etc.), extraerlo a `Infrastructure/utils/` con nombre semántico (`dateUtils.ts`, `employeeUtils.ts`, etc.).
- Los archivos nuevos en `utils/` deben agregarse al barrel `Infrastructure/index.ts`.
- Los repositorios solo contienen lógica de persistencia/mapeo con el modelo Sequelize.

## Registro DI (Awilix)

### `[domain].di.ts`

```typescript
import { asClass } from 'awilix';

export const entityApp = {
  entityRepository: asClass(EntityRepositoryImplementation),
  entityService: asClass(EntityService),
  entityController: asClass(EntityController),
  _createEntity: asClass(CreateEntity),
  _getAllEntities: asClass(GetAllEntities),
  _getEntity: asClass(GetEntity),
  _updateEntity: asClass(UpdateEntity),
  _deleteEntity: asClass(DeleteEntity),
};
```

### Archivos de registro global a actualizar

1. `packages/server/src/domains/register.ts` → importar y spreadeador `entityApp`
2. `packages/server/src/Infrastructure/Routes/Router.ts` → importar y spreadeador `EntityRoutes()`

## Buenas Prácticas Awilix

El contenedor global (`packages/server/src/Infrastructure/di/Container.ts`) se crea con:

```typescript
createContainer({
  injectionMode: InjectionMode.CLASSIC,
  strict: true,
});
```

Consecuencias normativas de esto:

### 1. El nombre del parámetro del constructor ES la clave de resolución

En `InjectionMode.CLASSIC` Awilix inspecciona los **nombres de los parámetros** del constructor y los resuelve contra las claves registradas. `strict: true` convierte cualquier dependencia no encontrada en `AwilixResolutionError`.

```typescript
// ❌ ERROR — AwilixResolutionError: Could not resolve 'certificateRepository'
constructor(private readonly certificateRepository: CertificateRepository) {}

// ✅ CORRECTO — el parámetro coincide con la clave registrada: 'certificatesRepository'
constructor(private readonly certificatesRepository: CertificateRepository) {}
```

> **Regla:** la clave registrada en `[domain].di.ts` (`certificatesRepository`) y el nombre del parámetro inyectado deben ser **idénticos**. El tipo TypeScript (`CertificateRepository`, singular) es solo el tipo: no lo copies como nombre de parámetro. Antes de escribir un constructor, abrí el `.di.ts` del dominio y copiá la clave exacta. Nunca la adivines por la clase.

### 2. Checklist de registro para un use case nuevo

Cada clase inyectable debe recorrer este flujo en orden:

1. La clase existe en `Application/UseCases/` y está exportada desde el barrel `Application/index.ts`.
2. Está registrada en el `.di.ts` de su dominio con clave `_camelCaseUseCase: asClass(...)`.
3. El parámetro del consumidor usa **exactamente** esa clave (`_getPendingLicenses`, no `getPendingLicenses` ni `_getPendingLicense`).
4. El objeto `[domain]App` está spread en `registerDomains()` de `packages/server/src/domains/register.ts`. Si falta, el dominio entero queda sin resolver.

### 3. Cross-domain: registra en el dominio dueño, no en el consumidor

Cuando un dominio (ej. `DailyReport`) usa casos de uso de otro (`Certificates`), esos use cases **solo** viven en el `.di.ts` del dominio dueño. El consumidor los inyecta por la clave expuesta:

```typescript
// certificates.di.ts — el único lugar donde se registra
_getPendingLicenses: asClass(GetPendingLicenses),

// GenerateDailyReport.usecase.ts — solo inyecta la clave del dueño
constructor(private readonly _getPendingLicenses: GetPendingLicenses) {}
```

Nunca registres en tu `.di.ts` un use case que pertenece a otro dominio: colisiona con el flat merge de `register.ts` y esconde quién es dueño del caso de uso.

### 4. `container.resolve()` solo en puntos de entrada

El único lugar permitido para `container.resolve()` son los resolvers de arranque del propio `.di.ts` (controllers, schedulers):

```typescript
export const entityController = () =>
  container.resolve<EntityController>('entityController');
```

Use cases, services y controllers **nunca** resuelven del contenedor: se inyectan vía constructor (Awilix los instancia por `asClass`). Resolver dentro de la lógica de negocio rompe el grafo de dependencias y duplica instancias.

### 5. Debugging de `AwilixResolutionError: Could not resolve 'X'`

El mensaje dice la clave que faltó. Orden de verificación:

1. `grep -rn "X" packages/server/src/domains/*/*.di.ts` — ¿existe la clave registrada en algún `.di.ts`? Si no existe, nunca la registraste.
2. ¿El parámetro del constructor está escrito **igual** (camelCase, singular/plural)? El caso más común es singular/plural: `certificateRepository` vs `certificatesRepository`.
3. ¿El `[domain]App` que la registra está spread en `register.ts`?
4. ¿Es cross-domain? Verificá que esté registrada en el `.di.ts` del dominio **dueño** del use case.
5. ¿Hay claves duplicadas por el flat merge? Nombres genéricos (`_create`, `_update`, `_delete`) colisionan; siempre incluir entidad/dominio.

## Convenciones de Nomenclatura

| Artefacto            | Patrón                                 | Ejemplo                                |
| -------------------- | -------------------------------------- | -------------------------------------- |
| Carpeta dominio      | PascalCase                             | `Articles/`                            |
| Entidad clase        | PascalCase                             | `Article`                              |
| Archivo entidad      | `[Entity].entity.ts`                   | `Article.entity.ts`                    |
| Archivo tipos        | `[domain].types.ts`                    | `articles.types.ts`                    |
| Repositorio abstract | `[Entity].repository.ts`               | `Articles.repository.ts`               |
| Use Case archivo     | `[Action][Entity].usecase.ts`          | `CreateArticle.usecase.ts`             |
| Use Case clase       | PascalCase                             | `CreateArticle`                        |
| Service              | `[Domain].service.ts`                  | `Articles.service.ts`                  |
| Controller           | `[Domain].controller.ts`               | `Articles.controller.ts`               |
| Modelo Sequelize     | `[Entity].model.ts`                    | `Article.model.ts`                     |
| Repo Impl            | `[Entity]Repository.implementation.ts` | `ArticlesRepository.implementation.ts` |
| App.ts               | `[domain].di.ts`                       | `article.di.ts`                        |
| DI - repositorio     | `[domain]Repository`                   | `articlesRepository`                   |
| DI - servicio        | `[domain]Service`                      | `articlesService`                      |
| DI - controlador     | `[domain]Controller`                   | `articlesController`                   |
| DI - use case        | `_[camelCaseUseCase]`                  | `_createArticle`                       |

## Error Handling

```typescript
throw new AppError('Mensaje descriptivo', 400, 'VALIDATION_ERROR');
```

- `AppError` → `TRPCErrorAdapter` convierte automáticamente.
- Nunca uses `throw new Error()` directamente en use cases o servicios.
- Nunca uses `TRPCError` directamente. Usar `TRPCError` acopla la capa Application/Domain a la infraestructura tRPC.

## Multi-Tenant

Siempre filtrar por `ownerId` en el repositorio:

```typescript
const { ownerId } = requestContext.values;
whereClause.id_propietario = ownerId;
```

## Restricciones

1. Los casos de uso importan e inyectan solo repositorios del mismo dominio, no puede importar otros repositorios.
2. Si un caso de uso necesita un método de otro dominio, deberá ser llamado desde un caso de uso exportado en el otro dominio, por medio de la inyección de dependencia sobre el caso de uso del dominio correspondiente. `Por ejemnplo: Auth necesita renovar contraseña del usuario, por lo que llamará al caso de uso correspondiente del dominio de Users`.
3. Evita utilizar `magics strings`.
4. Nunca uses `export * from './Infrastructure'` en el `index.ts` de dominio. Solo está permitido `export * from './Infrastructure/Routes'`. Exponer Controllers o modelos Sequelize rompe el encapsulamiento hexagonal.
5. Nunca instancies clases con `new` dentro de use cases, services o controllers. Todas las dependencias deben inyectarse vía constructor. Usar `new` rompe el contenedor Awilix y genera dependencias no registradas.
6. Las claves de use cases en el registro Awilix (`_[camelCaseUseCase]`) deben incluir siempre el nombre de la entidad o dominio. Claves genéricas como `_create`, `_update`, `_delete` están prohibidas — colisionan en el contenedor DI global (flat merge en `register.ts`).
7. Los nombres de los métodos, variables, class, etc. deben ser camelcase. Ej: `Rename class "Empresas_usuariosService" to match the regular expression ^\$?[A-Z][a-zA-Z0-9]*$.`.
8. Prefer using nullish coalescing operator (`??`) instead of a ternary expression, as it is simpler to read.
9. No definas helpers estáticos privados dentro de los repositorios si no usan el modelo Sequelize. Las funciones puras (fechas, formateo, nombres, mapeo de datos) van en `packages/server/src/Infrastructure/utils/` y se importan desde `@server/Infrastructure`. Ver sección "Utilidades compartidas".
10. El nombre del parámetro de un constructor inyectado debe ser **idéntico** a la clave registrada en `[domain].di.ts`. Con `InjectionMode.CLASSIC` + `strict: true`, cualquier mismatch (singular/plural, typo, camelCase) lanza `AwilixResolutionError: Could not resolve '<param>'`. Nunca infieras la clave por el nombre de la clase o el tipo de la interface: abrí el `.di.ts` del dominio y copiá la clave exacta. Ver sección "Buenas Prácticas Awilix".
