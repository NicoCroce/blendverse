---
name: back-ddd-generator
description: Genera un dominio DDD completo en el servidor: entidad, interfaces, repositorio, use cases, servicio, controlador, modelo Sequelize, implementación de repositorio, rutas tRPC y registro DI. Incluye las actualizaciones a los archivos globales de registro.
---

# Back DDD Generator

## ⚠️ CONTROL DE CONTEXTO (ESTRICTO)

- **MODO AISLADO:** No uses `@workspace`. Solo el contexto que el usuario te provee.
- **TRABAJA UN DOMINIO A LA VEZ** y verifica errores tras cada creación.
- **NO modifiques archivos fuera de `packages/server/`** excepto los dos archivos de registro global indicados al final.

## Herramientas Requeridas

- `read/readFile` — Para leer archivos de referencia antes de comenzar
- `edit/createFile` — Para crear cada archivo del dominio
- `edit/editFiles` — Para actualizar los archivos globales de registro
- `diagnostics/getErrors` — Para verificar errores al finalizar

---

## Convención de Nombres del Proyecto

| Elemento                                 | Idioma      | Ejemplos                                  |
| ---------------------------------------- | ----------- | ----------------------------------------- |
| Carpeta del dominio                      | **Inglés**  | `ArticleSpecialDiscounts/`, `Customers/`  |
| Clases (Entidad, Modelo, Servicio, etc.) | **Inglés**  | `ArticleSpecialDiscount`, `CustomerModel` |
| Atributos de la entidad                  | **Español** | `cantidad_minima`, `tipo_descuento`       |
| Nombres de columnas en la DB             | **Español** | `id_articulo`, `fecha_sincronizacion_mg`  |
| Parámetros de interfaces                 | **Español** | `id_propietario`, `denominacion`          |

> **IMPORTANTE:** Nunca traducir los nombres de columnas ni atributos de entidad al inglés. Siempre mantener los nombres tal como están en la base de datos.

---

## Protocolo de Preguntas (OBLIGATORIO si faltan datos)

Antes de generar cualquier archivo, pregunta al usuario:

1. **Nombre de la entidad** (PascalCase singular): ej. `Product`
2. **Nombre del dominio** (PascalCase plural): ej. `Products` → carpeta `Products/`
3. **Atributos de la entidad** con sus tipos TypeScript: ej. `nombre: string`, `precio: number`, `activo: boolean`
4. **¿Cuáles son los campos obligatorios vs opcionales?**
5. **Operaciones CRUD necesarias**: `getAll`, `getById`, `create`, `update`, `delete` (¿todas o un subset?)
6. **¿Necesita paginación en `getAll`?** (casi siempre sí)
7. **¿Hay relaciones con otros dominios?** (ver skill `cross-domain-relations`)

---

## Validación de Estructura (OBLIGATORIO)

Antes de crear el primer archivo, lista para el usuario el árbol de carpetas y archivos exactos que vas a crear. **No procedas sin aprobación.**

```
packages/server/src/domains/[Domain]/
├── Domain/
│   ├── [Entity].entity.ts
│   ├── [Entity].interfaces.ts
│   ├── [Entity].repository.ts
│   └── index.ts
├── Application/
│   ├── UseCases/
│   │   ├── GetAll[Entities].usecase.ts
│   │   ├── Get[Entity].usecase.ts
│   │   ├── Create[Entity].usecase.ts
│   │   ├── Update[Entity].usecase.ts
│   │   ├── Delete[Entity].usecase.ts
│   │   └── index.ts
│   ├── [Domain].service.ts
│   └── index.ts
├── Infrastructure/
│   ├── Controllers/
│   │   ├── [Domain].controller.ts
│   │   └── index.ts
│   ├── Database/
│   │   ├── [Entity].model.ts
│   │   ├── [Entity]Repository.implementation.ts
│   │   └── index.ts
│   ├── Routes/
│   │   ├── [Domain].routes.ts
│   │   └── index.ts
│   └── index.ts
├── [domain].app.ts
└── index.ts

Archivos globales a actualizar:
  packages/server/src/domains/register.ts
  packages/server/src/Infrastructure/Routes/Router.ts
```

---

## Estructura de Archivos a Generar y Mapeo de Templates

### Variables de sustitución

- `[Entity]` = nombre singular PascalCase → ej. `Product`
- `[Entities]` = nombre plural PascalCase → ej. `Products`
- `[Domain]` = nombre del dominio PascalCase → ej. `Products`
- `[domain]` = nombre del dominio camelCase → ej. `products`
- `[domainFolder]` = nombre de la carpeta → ej. `Products`
- `[fields]` = atributos específicos del usuario

---

## Template: `Domain/[Entity].entity.ts`

```typescript
export class [Entity] {
  constructor(
    protected readonly _id_propietario: number,
    // [fields como _field: TipoTS]
    protected readonly _id?: number,
  ) {}

  static create({
    id,
    id_propietario,
    // [fields destructuriados]
  }: I[Entity]): [Entity] {
    return new [Entity](
      id_propietario,
      // [fields en orden]
      id,
    );
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this._id,
      id_propietario: this._id_propietario,
      // [fields con getters]
    };
  }
}
```

---

## Template: `Domain/[Entity].interfaces.ts`

```typescript
import { IPagination, IRequestContext } from '@server/Application';

// Interfaz plana de la entidad (usada en entity.create() y en el repo)
export interface I[Entity] {
  id?: number;
  id_propietario: number;
  // [fields con tipos]
}

// --- Interfaces de entrada para Use Cases ---

export interface IGetAll[Entities] extends IRequestContext {
  input?: {
    // filtros de búsqueda opcionales
  } & IPagination;
}

export interface IGet[Entity] extends IRequestContext {
  input: number; // id
}

export interface ICreate[Entity] extends IRequestContext {
  input: {
    id_propietario: number;
    // [fields obligatorios]
  };
}

export interface IUpdate[Entity] extends IRequestContext {
  input: {
    id: number;
    id_propietario: number;
    // [fields actualizables]
  };
}

export interface IDelete[Entity] extends IRequestContext {
  input: number; // id
}
```

---

## Template: `Domain/[Entity].repository.ts`

```typescript
import { IPaginationResponse, IRequestContext, ISelect } from '@server/Application';
import { [Entity] } from './[Entity].entity';

// --- Interfaces de entrada para el repositorio ---

export interface IGetAll[Entities]Repository extends IRequestContext {
  filters?: {
    // filtros opcionales
  } & import('@server/Application').IPagination;
}

export interface IGet[All][Entities]RepositoryResponse
  extends IPaginationResponse<[Entity][]> {}

export interface ICreate[Entity]Repository extends IRequestContext {
  [entity]: [Entity];
}

export interface IGet[Entity]Repository extends IRequestContext {
  id: number;
}

export interface IUpdate[Entity]Repository extends IRequestContext {
  [entity]: [Entity];
}

export interface IDelete[Entity]Repository extends IRequestContext {
  id: number;
}

// --- Puerto abstracto (interface) ---

export interface [Entity]Repository {
  getAll[Entities](params: IGetAll[Entities]Repository): Promise<IGetAll[Entities]RepositoryResponse>;
  get[Entity](params: IGet[Entity]Repository): Promise<[Entity] | null>;
  create[Entity](params: ICreate[Entity]Repository): Promise<[Entity]>;
  update[Entity](params: IUpdate[Entity]Repository): Promise<[Entity]>;
  delete[Entity](params: IDelete[Entity]Repository): Promise<number>;
}
```

---

## Template: `Domain/index.ts`

```typescript
export * from './[Entity].entity';
export * from './[Entity].interfaces';
export * from './[Entity].repository';
```

---

## Template: `Application/UseCases/GetAll[Entities].usecase.ts`

```typescript
import { IUseCase } from '@server/Application';
import { [Entity]Repository } from '../../Domain/[Entity].repository';
import { IGetAll[Entities] } from '../../Domain/[Entity].interfaces';
import { IGetAll[Entities]RepositoryResponse } from '../../Domain/[Entity].repository';

export class GetAll[Entities] implements IUseCase<IGetAll[Entities]RepositoryResponse> {
  constructor(private readonly [entity]Repository: [Entity]Repository) {}

  async execute({ input, requestContext }: IGetAll[Entities]): Promise<IGetAll[Entities]RepositoryResponse> {
    return this.[entity]Repository.getAll[Entities]({
      filters: input,
      requestContext,
    });
  }
}
```

---

## Template: `Application/UseCases/Get[Entity].usecase.ts`

```typescript
import { AppError, IUseCase } from '@server/Application';
import { [Entity]Repository } from '../../Domain/[Entity].repository';
import { IGet[Entity] } from '../../Domain/[Entity].interfaces';
import { [Entity] } from '../../Domain/[Entity].entity';

export class Get[Entity] implements IUseCase<[Entity]> {
  constructor(private readonly [entity]Repository: [Entity]Repository) {}

  async execute({ input, requestContext }: IGet[Entity]): Promise<[Entity]> {
    const result = await this.[entity]Repository.get[Entity]({ id: input, requestContext });
    if (!result) throw new AppError('[Entity] no encontrado', 404, 'NOT_FOUND');
    return result;
  }
}
```

---

## Template: `Application/UseCases/Create[Entity].usecase.ts`

```typescript
import { IUseCase } from '@server/Application';
import { [Entity]Repository } from '../../Domain/[Entity].repository';
import { ICreate[Entity] } from '../../Domain/[Entity].interfaces';
import { [Entity] } from '../../Domain/[Entity].entity';

export class Create[Entity] implements IUseCase<[Entity]> {
  constructor(private readonly [entity]Repository: [Entity]Repository) {}

  async execute({ input, requestContext }: ICreate[Entity]): Promise<[Entity]> {
    const new[Entity] = [Entity].create({ ...input });
    return this.[entity]Repository.create[Entity]({ [entity]: new[Entity], requestContext });
  }
}
```

---

## Template: `Application/UseCases/Update[Entity].usecase.ts`

```typescript
import { IUseCase } from '@server/Application';
import { [Entity]Repository } from '../../Domain/[Entity].repository';
import { IUpdate[Entity] } from '../../Domain/[Entity].interfaces';
import { [Entity] } from '../../Domain/[Entity].entity';

export class Update[Entity] implements IUseCase<[Entity]> {
  constructor(private readonly [entity]Repository: [Entity]Repository) {}

  async execute({ input, requestContext }: IUpdate[Entity]): Promise<[Entity]> {
    const entity = [Entity].create({ ...input });
    return this.[entity]Repository.update[Entity]({ [entity]: entity, requestContext });
  }
}
```

---

## Template: `Application/UseCases/Delete[Entity].usecase.ts`

```typescript
import { IUseCase } from '@server/Application';
import { [Entity]Repository } from '../../Domain/[Entity].repository';
import { IDelete[Entity] } from '../../Domain/[Entity].interfaces';

export class Delete[Entity] implements IUseCase<number> {
  constructor(private readonly [entity]Repository: [Entity]Repository) {}

  async execute({ input, requestContext }: IDelete[Entity]): Promise<number> {
    return this.[entity]Repository.delete[Entity]({ id: input, requestContext });
  }
}
```

---

## Template: `Application/UseCases/index.ts`

```typescript
export * from './GetAll[Entities].usecase';
export * from './Get[Entity].usecase';
export * from './Create[Entity].usecase';
export * from './Update[Entity].usecase';
export * from './Delete[Entity].usecase';
```

---

## Template: `Application/[Domain].service.ts`

```typescript
import { executeUseCase, IPaginationResponse } from '@server/Application';
import {
  [Entity],
  IGetAll[Entities],
  IGet[Entity],
  ICreate[Entity],
  IUpdate[Entity],
  IDelete[Entity],
} from '../Domain';
import { GetAll[Entities], Get[Entity], Create[Entity], Update[Entity], Delete[Entity] } from './UseCases';
import { IGetAll[Entities]RepositoryResponse } from '../Domain/[Entity].repository';

export class [Domain]Service {
  constructor(
    private readonly _getAll[Entities]: GetAll[Entities],
    private readonly _get[Entity]: Get[Entity],
    private readonly _create[Entity]: Create[Entity],
    private readonly _update[Entity]: Update[Entity],
    private readonly _delete[Entity]: Delete[Entity],
  ) {}

  async getAll[Entities]({ input, requestContext }: IGetAll[Entities]): Promise<IGetAll[Entities]RepositoryResponse | null> {
    return executeUseCase({ useCase: this._getAll[Entities], input, requestContext });
  }

  async get[Entity]({ input, requestContext }: IGet[Entity]): Promise<[Entity] | null> {
    return executeUseCase({ useCase: this._get[Entity], input, requestContext });
  }

  async create[Entity]({ input, requestContext }: ICreate[Entity]): Promise<[Entity] | null> {
    return executeUseCase({ useCase: this._create[Entity], input, requestContext });
  }

  async update[Entity]({ input, requestContext }: IUpdate[Entity]): Promise<[Entity] | null> {
    return executeUseCase({ useCase: this._update[Entity], input, requestContext });
  }

  async delete[Entity]({ input, requestContext }: IDelete[Entity]): Promise<number | null> {
    return executeUseCase({ useCase: this._delete[Entity], input, requestContext });
  }
}
```

---

## Template: `Application/index.ts`

```typescript
export * from './[Domain].service';
export * from './UseCases';
```

---

## Template: `Infrastructure/Controllers/[Domain].controller.ts`

```typescript
import { protectedProcedure } from '@server/Infrastructure';
import { [Domain]Service } from '../../Application';
import { executeService } from '@server/Application';
import z from 'zod';
import { paginationZodParams } from '@server/utils';

export class [Domain]Controller {
  constructor(private [domain]Service: [Domain]Service) {}

  getAll = () =>
    protectedProcedure
      .input(
        z.object({
          // filtros opcionales con .default('')
          ...paginationZodParams,
        }).optional(),
      )
      .query(executeService(this.[domain]Service.getAll[Entities].bind(this.[domain]Service)));

  get[Entity] = () =>
    protectedProcedure
      .input(z.number().min(1, 'ID requerido'))
      .query(executeService(this.[domain]Service.get[Entity].bind(this.[domain]Service)));

  create[Entity] = () =>
    protectedProcedure
      .input(
        z.object({
          // campos obligatorios del input
        }),
      )
      .mutation(executeService(this.[domain]Service.create[Entity].bind(this.[domain]Service)));

  update[Entity] = () =>
    protectedProcedure
      .input(
        z.object({
          id: z.number().min(1),
          // campos actualizables
        }),
      )
      .mutation(executeService(this.[domain]Service.update[Entity].bind(this.[domain]Service)));

  delete[Entity] = () =>
    protectedProcedure
      .input(z.number().min(1, 'ID requerido'))
      .mutation(executeService(this.[domain]Service.delete[Entity].bind(this.[domain]Service)));
}
```

---

## Template: `Infrastructure/Controllers/index.ts`

```typescript
export * from './[Domain].controller';
```

---

## Template: `Infrastructure/Database/[Entity].model.ts`

```typescript
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '@server/Infrastructure';
import { I[Entity] } from '../../Domain';

type I[Entity]CreationAttributes = Optional<I[Entity], 'id'>;

export class [Entity]Model extends Model<I[Entity], I[Entity]CreationAttributes> {}

[Entity]Model.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_propietario: { type: DataTypes.INTEGER, allowNull: false },
    // [fields con DataTypes correspondientes]
  },
  {
    sequelize,
    tableName: '[tabla_en_bd]',
    timestamps: false,
  },
);

export default [Entity]Model;
```

---

## Template: `Infrastructure/Database/[Entity]Repository.implementation.ts`

```typescript
import { Op } from 'sequelize';
import {
  [Entity],
  [Entity]Repository,
  IGetAll[Entities]Repository,
  IGetAll[Entities]RepositoryResponse,
  IGet[Entity]Repository,
  ICreate[Entity]Repository,
  IUpdate[Entity]Repository,
  IDelete[Entity]Repository,
} from '../../Domain';
import { [Entity]Model } from './[Entity].model';
import { PaginationImplementation } from '@server/utils';

export class [Entity]RepositoryImplementation implements [Entity]Repository {
  async getAll[Entities]({
    filters,
    requestContext,
  }: IGetAll[Entities]Repository): Promise<IGetAll[Entities]RepositoryResponse> {
    const { limit, offset, createPaginatedResponse } = PaginationImplementation(filters);
    const { ownerId } = requestContext.values;

    const whereClause: Record<string, unknown> = {};
    if (ownerId) whereClause.id_propietario = ownerId;
    // Agregar filtros adicionales según los campos del dominio

    const { rows, count } = await [Entity]Model.findAndCountAll({
      where: whereClause,
      limit,
      offset,
    });

    const entities = rows.map((row) => [Entity].create(row.dataValues));
    return createPaginatedResponse(entities, count);
  }

  async get[Entity]({ id, requestContext }: IGet[Entity]Repository): Promise<[Entity] | null> {
    const { ownerId } = requestContext.values;
    const row = await [Entity]Model.findOne({ where: { id, id_propietario: ownerId } });
    if (!row) return null;
    return [Entity].create(row.dataValues);
  }

  async create[Entity]({ [entity], requestContext }: ICreate[Entity]Repository): Promise<[Entity]> {
    const { ownerId } = requestContext.values;
    const row = await [Entity]Model.create({ ...([entity].values), id_propietario: ownerId });
    return [Entity].create(row.dataValues);
  }

  async update[Entity]({ [entity], requestContext }: IUpdate[Entity]Repository): Promise<[Entity]> {
    const { ownerId } = requestContext.values;
    const { id, ...rest } = [entity].values;
    await [Entity]Model.update({ ...rest }, { where: { id, id_propietario: ownerId } });
    const updated = await [Entity]Model.findByPk(id);
    return [Entity].create(updated!.dataValues);
  }

  async delete[Entity]({ id, requestContext }: IDelete[Entity]Repository): Promise<number> {
    const { ownerId } = requestContext.values;
    return [Entity]Model.destroy({ where: { id, id_propietario: ownerId } });
  }
}
```

---

## Template: `Infrastructure/Database/index.ts`

```typescript
export * from './[Entity].model';
export * from './[Entity]Repository.implementation';
```

---

## Template: `Infrastructure/Routes/[Domain].routes.ts`

```typescript
import { router } from '@server/Infrastructure';
import { [domain]Controller } from '@server/domains/[Domain]';

export const [Domain]Routes = () => ({
  [domain]: router({
    getAll: [domain]Controller().getAll(),
    get: [domain]Controller().get[Entity](),
    create: [domain]Controller().create[Entity](),
    update: [domain]Controller().update[Entity](),
    delete: [domain]Controller().delete[Entity](),
  }),
});

export type T[Domain]Router = ReturnType<typeof [Domain]Routes>['[domain]'];
```

---

## Template: `Infrastructure/Routes/index.ts`

```typescript
export * from './[Domain].routes';
```

---

## Template: `Infrastructure/index.ts`

```typescript
export * from './Controllers';
export * from './Database';
export * from './Routes';
```

---

## Template: `[domain].app.ts`

```typescript
import { asClass } from 'awilix';
import {
  [Domain]Service,
  GetAll[Entities],
  Get[Entity],
  Create[Entity],
  Update[Entity],
  Delete[Entity],
} from './Application';
import { [Domain]Controller, [Entity]RepositoryImplementation } from './Infrastructure';
import { container } from '@server/utils/Container';

export const [domain]App = {
  [domain]Repository: asClass([Entity]RepositoryImplementation),
  [domain]Service: asClass([Domain]Service),
  [domain]Controller: asClass([Domain]Controller),
  _getAll[Entities]: asClass(GetAll[Entities]),
  _get[Entity]: asClass(Get[Entity]),
  _create[Entity]: asClass(Create[Entity]),
  _update[Entity]: asClass(Update[Entity]),
  _delete[Entity]: asClass(Delete[Entity]),
};

export const [domain]Controller = () =>
  container.resolve<[Domain]Controller>('[domain]Controller');
```

---

## Template: `index.ts` (barrel público)

```typescript
export * from './Domain';
export * from './Application';
export * from './Infrastructure';
```

---

## Archivos Globales a Actualizar

### 1. `packages/server/src/domains/register.ts`

Agregar el import del nuevo app y spreadearlo en `registerDomains`:

```typescript
import { [domain]App } from './[Domain]';

export const registerDomains = () => ({
  // ... existentes ...
  ...[domain]App,
});
```

### 2. `packages/server/src/Infrastructure/Routes/Router.ts`

Agregar el import de las rutas y spreadearlo en `MainRouter`:

```typescript
import { [Domain]Routes } from '@server/domains/[Domain]';

const MainRouter = () => {
  const AllRouters = {
    // ... existentes ...
    ...[Domain]Routes(),
  };
  return router(AllRouters);
};
```

---

## Restricciones

1. Los casos de uso importan e inyectan solo repositorios del mismo dominio, no puede importar otros repositorios.
2. Si un caso de uso necesita un método de otro dominio, deberá ser llamado desde un caso de uso exportado en el otro dominio, por medio de la inyección de dependencia sobre el caso de uso del dominio correspondiente. `Por ejemnplo: Auth necesita renovar contraseña del usuario, por lo que llamará al caso de uso correspondiente del dominio de Users`.

## Checklist Final

Tras crear todos los archivos, ejecuta `diagnostics/getErrors` y verifica:

- [ ] No hay errores de TypeScript
- [ ] Los imports usan `@server/*` (no rutas relativas entre dominios)
- [ ] El `[domain].app.ts` exporta todos los use cases con prefijo `_`
- [ ] `register.ts` incluye el nuevo dominio
- [ ] `Router.ts` incluye las nuevas rutas
- [ ] El repositorio filtra por `ownerId` en cada método que corresponde
