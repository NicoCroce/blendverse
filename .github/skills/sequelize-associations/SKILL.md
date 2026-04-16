---
name: sequelize-associations
description: Patrones de asociaciones y carga ansiosa (eager loading) en Sequelize v6 para MacroGest Core. Usar cuando se necesite definir belongsTo/hasMany/hasOne entre modelos, hacer findAll con include, ampliar el tipo del modelo para incluir asociaciones tipadas, o realizar queries con joins multi-tenant seguros. NO usar para crear un dominio desde cero (usar back-ddd-generator) ni para lógica de cross-domain en la capa Application (usar cross-domain-relations).
---

# Sequelize Associations (v6)

## ⚠️ REGLAS GENERALES

- **Solo modifica archivos de `Infrastructure/Database/`** del dominio que corresponde.
- **Las asociaciones siempre se declaran de forma estática** (fuera de la clase del modelo, al final del archivo `.model.ts`).
- **Nunca importes un modelo de otro dominio en la capa Domain o Application** — solo en la capa `Infrastructure/Database/`.
- **Siempre filtrá por `id_propietario`** cuando la entidad tenga propietario.

---

## Paso 1 — Declarar la Asociación en el Modelo

Las asociaciones deben declararse **una sola vez**, al final del archivo `.model.ts`. Si dos modelos se necesitan mutuamente, uno importa al otro (evitar ciclos: preferir importar el modelo "más básico" desde el "más complejo").

### `belongsTo` (N→1) — el modelo tiene una FK hacia otro

```typescript
// packages/server/src/domains/Customeruserss/Infrastructure/Database/Customeruserss.model.ts
import {
  DataTypes,
  Model,
  Optional,
  BelongsToGetAssociationMixin,
} from 'sequelize';
import { sequelize } from '@server/Infrastructure';
import { ICustomeruserss } from '../../Domain';
import { UserModel } from '@server/domains/Users/Infrastructure/Database/User.model';
import { CustomerModel } from '@server/domains/Customers/Infrastructure/Database/Customer.model';

type ICustomeruserssCreationAttributes = Optional<ICustomeruserss, 'id'>;

export class CustomerusersModel extends Model<
  ICustomeruserss,
  ICustomeruserssCreationAttributes
> {
  // Mixins tipados para el acceso del ORM
  declare getUser: BelongsToGetAssociationMixin<UserModel>;
  declare getCustomer: BelongsToGetAssociationMixin<CustomerModel>;

  // Campos virtuales que Sequelize rellena con include
  declare User?: UserModel;
  declare Customer?: CustomerModel;
}

CustomerusersModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_propietario: { type: DataTypes.INTEGER, allowNull: false },
    id_usuario: { type: DataTypes.INTEGER, allowNull: false },
    id_cliente: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, tableName: 'customeruserss', timestamps: false },
);

// Asociaciones estáticas (al final, después de init)
CustomerusersModel.belongsTo(UserModel, {
  foreignKey: 'id_usuario',
  as: 'User',
});
CustomerusersModel.belongsTo(CustomerModel, {
  foreignKey: 'id_cliente',
  as: 'Customer',
});
```

### `hasMany` (1→N) — el modelo padre tiene muchos hijos

```typescript
// En el modelo padre (ej. CustomerModel)
import { HasManyGetAssociationsMixin } from 'sequelize';
import { CustomerusersModel } from '@server/domains/Customeruserss/Infrastructure/Database';

// Dentro de la clase:
declare getCustomeruserss: HasManyGetAssociationsMixin<CustomerusersModel>;
declare Customeruserss?: CustomerusersModel[];

// Fuera de la clase, luego del init:
CustomerModel.hasMany(CustomerusersModel, { foreignKey: 'id_cliente', as: 'Customeruserss' });
```

### `hasOne` (1→1) — el modelo padre tiene un solo hijo

```typescript
import { HasOneGetAssociationMixin } from 'sequelize';

declare getProfile: HasOneGetAssociationMixin<ProfileModel>;
declare Profile?: ProfileModel;

UserModel.hasOne(ProfileModel, { foreignKey: 'id_usuario', as: 'Profile' });
```

---

## Paso 2 — Usar `include` en Queries del Repositorio

Una vez declaradas las asociaciones, puedes usarlas en `findAll` / `findOne` con `include`.

### Ejemplo: `findAll` con `include` + filtro multi-tenant

```typescript
async getAllCustomeruserss({
  filters,
  requestContext,
}: IGetAllCustomeruserssRepository): Promise<IGetAllCustomeruserssRepositoryResponse> {
  const { limit, offset, createPaginatedResponse } = PaginationImplementation(filters);
  const { ownerId } = requestContext.values;

  const whereClause: Record<string, unknown> = {};
  if (ownerId) whereClause.id_propietario = ownerId;

  const { rows, count } = await CustomerusersModel.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    // Eager loading: solo pedimos los atributos que necesitamos
    include: [
      { model: UserModel, attributes: ['nombre', 'email'] },
      { model: CustomerModel, attributes: ['denominacion'] },
    ],
  });

  const entities = rows.map(({ dataValues, User, Customer }) =>
    Customeruserss.create({
      ...dataValues,
      userName: User?.nombre?.toString() ?? '',
      customerName: Customer?.denominacion?.toString() ?? '',
    }),
  );

  return createPaginatedResponse(entities, count);
}
```

### Ejemplo: `findOne` con `include`

```typescript
async getCustomeruserss({ id, requestContext }: IGetCustomeruserssRepository): Promise<Customeruserss | null> {
  const { ownerId } = requestContext.values;

  const row = await CustomerusersModel.findOne({
    where: { id, id_propietario: ownerId },
    include: [
      { model: UserModel, attributes: ['nombre'] },
    ],
  });

  if (!row) return null;
  return Customeruserss.create({
    ...row.dataValues,
    userName: row.User?.nombre?.toString() ?? '',
  });
}
```

---

## Paso 3 — Tipar los Campos Virtuales en la Entidad

Si el dominio necesita exponer datos del modelo incluido (ej. `userName`), agregalos a la interfaz `I[Entity]` y a los `values` de la entidad:

```typescript
// Domain/Customeruserss.interfaces.ts
export interface ICustomeruserss {
  id?: number;
  id_propietario: number;
  id_usuario: number;
  id_cliente: number;
  // Campos calculados (provienen de includes, no de la tabla propia)
  userName?: string;
  customerName?: string;
}
```

```typescript
// Domain/Customeruserss.entity.ts
export class Customeruserss {
  constructor(
    protected readonly _id_propietario: number,
    protected readonly _id_usuario: number,
    protected readonly _id_cliente: number,
    protected readonly _userName: string,
    protected readonly _customerName: string,
    protected readonly _id?: number,
  ) {}

  static create({
    id,
    id_propietario,
    id_usuario,
    id_cliente,
    userName = '',
    customerName = '',
  }: ICustomeruserss): Customeruserss {
    return new Customeruserss(
      id_propietario,
      id_usuario,
      id_cliente,
      userName,
      customerName,
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
      id_usuario: this._id_usuario,
      id_cliente: this._id_cliente,
      userName: this._userName,
      customerName: this._customerName,
    };
  }
}
```

---

## Paso 4 — Evitar Ciclos de Importación

Si dos modelos (A y B) se referencian mutuamente, **solo uno debe importar al otro**. El otro usa lazy-load o no declara la inversa.

```typescript
// ✅ Correcto: A importa B (B es más básico)
// CustomerusersModel importa UserModel y CustomerModel

// ❌ Incorrecto: A importa B Y B importa A (ciclo)
```

Si el ciclo es inevitable, usa `() => ModelClass` como función de resolución:

```typescript
CustomerModel.hasMany(() => CustomerusersModel, {
  foreignKey: 'id_cliente',
  as: 'Customeruserss',
});
```

---

## Paso 5 — Checklist Final

- [ ] Las asociaciones están declaradas **después** de `Model.init()`
- [ ] Los campos virtuales (`declare User?: UserModel`) están declarados en la clase
- [ ] Los `include` solo piden los `attributes` necesarios (no `*`)
- [ ] Todos los queries filtran por `id_propietario` si la entidad lo tiene
- [ ] La entidad Domain tiene los campos calculados como opcionales (`userName?: string`)
- [ ] `diagnostics/getErrors` no reporta errores de tipos en el repositorio

---

## Anti-patrones a Evitar

```typescript
// ❌ Buscar con include sin where (puede traer registros de otro propietario)
await CustomerusersModel.findAll({ include: [UserModel] });

// ❌ Usar dataValues directamente sin mapear a entidad de dominio
return rows; // Los Model instances de Sequelize NO son entidades de dominio

// ❌ Tipar el resultado de include como 'any'
const user = (row as any).User; // Usar los declare fields del modelo

// ❌ Importar el modelo de un dominio en la capa Application o Domain
import { UserModel } from '@server/domains/Users/Infrastructure'; // Solo válido en Infrastructure/Database/
```
