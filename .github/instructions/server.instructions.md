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
│   ├── [Entity].interfaces.ts                # Input/Output interfaces de use cases
│   ├── [Entity].repository.ts                # Puerto abstracto de repositorio
│   └── index.ts                              # Barrel export de la capa
├── Application/
│   ├── UseCases/
│   │   ├── [Action][Entity].usecase.ts       # Implementa IUseCase<TOutput>
│   │   └── index.ts
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
├── [domain].app.ts                           # Registro Awilix del dominio
└── index.ts                                  # Barrel export público
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

### Interfaces de Entrada/Salida

Siempre extendén `IRequestContext`. El campo `input` lleva los datos de la operación.

```typescript
import { IRequestContext, IPagination } from '@server/Application';

export interface IGetAllEntities extends IRequestContext {
  input?: { search?: string } & IPagination;
}
export interface ICreateEntity extends IRequestContext {
  input: { field1: string; field2: number };
}
export interface IGetEntity extends IRequestContext {
  input: number;
}
export interface IUpdateEntity extends IRequestContext {
  input: { id: number; field1: string };
}
export interface IDeleteEntity extends IRequestContext {
  input: number;
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

## Application Layer

### Use Case

```typescript
import { AppError, IUseCase } from '@server/Application';
import { EntityRepository } from '../../Domain/Entity.repository';

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

## Registro DI (Awilix)

### `[domain].app.ts`

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

## Convenciones de Nomenclatura

| Artefacto            | Patrón                                 | Ejemplo                                |
| -------------------- | -------------------------------------- | -------------------------------------- |
| Carpeta dominio      | PascalCase                             | `Articles/`                            |
| Entidad clase        | PascalCase                             | `Article`                              |
| Archivo entidad      | `[Entity].entity.ts`                   | `Article.entity.ts`                    |
| Archivo interfaces   | `[Entity].interfaces.ts`               | `Articles.interfaces.ts`               |
| Repositorio abstract | `[Entity].repository.ts`               | `Articles.repository.ts`               |
| Use Case archivo     | `[Action][Entity].usecase.ts`          | `CreateArticle.usecase.ts`             |
| Use Case clase       | PascalCase                             | `CreateArticle`                        |
| Service              | `[Domain].service.ts`                  | `Articles.service.ts`                  |
| Controller           | `[Domain].controller.ts`               | `Articles.controller.ts`               |
| Modelo Sequelize     | `[Entity].model.ts`                    | `Article.model.ts`                     |
| Repo Impl            | `[Entity]Repository.implementation.ts` | `ArticlesRepository.implementation.ts` |
| App.ts               | `[domain].app.ts`                      | `article.app.ts`                       |
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
