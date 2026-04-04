---
name: cross-domain-relations
description: Patrones para relacionar datos entre dominios usando casos de uso e inyección de dependencias
---

# Relaciones Entre Dominios

## Descripción

Patrones y convenciones para relacionar datos entre diferentes dominios respetando la arquitectura DDD y evitando acoplamiento directo entre dominios.

## Principio Fundamental

**Los dominios NO deben acceder directamente a los repositorios de otros dominios.**

En lugar de eso, deben:

1. Crear casos de uso específicos que expongan la funcionalidad necesaria
2. Inyectar esos casos de uso en el dominio que los necesita
3. Usar `executeUseCase` para invocarlos

## Patrón: Relación a Través de Tabla Intermedia

### Contexto del Ejemplo

Imaginemos tres dominios:

- **Customeruserss**: Tabla intermedia que relaciona clientes con usuarios
- **Users**: Dominio de usuarios con emails
- **Recipt**: Dominio que necesita enviar emails a usuarios relacionados con un cliente

### Paso 1: Crear Caso de Uso para Obtener Relaciones

Primero, en el dominio de la tabla intermedia, crear un caso de uso que devuelva las relaciones sin paginación.

**Archivo**: `packages/server/src/domains/Customeruserss/Application/UseCases/GetAllUsersByCustomerId.usecase.ts`

```typescript
import { IUseCase } from '@server/Application';
import { Customerusers } from '../../Domain/Customeruserss.entity';
import { CustomeruserssRepository } from '../../Domain/Customeruserss.repository';
import { IGetAllCustomeruserssByCustomerId } from '../../Domain/Customeruserss.interfaces';

export class GetAllUsersByCustomerId implements IUseCase<Customerusers[]> {
  constructor(
    private readonly customeruserssRepository: CustomeruserssRepository,
  ) {}

  async execute({
    input,
    requestContext,
  }: IGetAllCustomeruserssByCustomerId): Promise<Customerusers[]> {
    return await this.customeruserssRepository.getAllCustomeruserssByCustomerId(
      {
        customerId: input.customerId,
        requestContext,
      },
    );
  }
}
```

**Interfaz del Caso de Uso**: `packages/server/src/domains/Customeruserss/Domain/Customeruserss.interfaces.ts`

```typescript
export interface IGetAllCustomeruserssByCustomerId extends IRequestContext {
  input: {
    customerId: number;
  };
}
```

**Interfaz del Repositorio**: `packages/server/src/domains/Customeruserss/Domain/Customeruserss.repository.ts`

```typescript
export interface IGetCustomeruserssByCustomerIdRepository
  extends IRequestContext {
  customerId: number;
}

export interface CustomeruserssRepository {
  // ... otros métodos
  getAllCustomeruserssByCustomerId(
    params: IGetCustomeruserssByCustomerIdRepository,
  ): Promise<Customerusers[]>;
}
```

**⚠️ Nota Importante**: Crear interfaces específicas de repositorio cuando:

- El parámetro no coincide con interfaces existentes
- Se necesita una firma diferente que no use `filters`
- Se pasan parámetros directos como `customerId`, `userId`, etc.

**Implementación del Repositorio**: `packages/server/src/domains/Customeruserss/Infrastructure/Database/CustomeruserssRepository.implementation.ts`

```typescript
async getAllCustomeruserssByCustomerId({
  customerId,
  requestContext,
}: IGetCustomeruserssByCustomerIdRepository): Promise<Customerusers[]> {
  const whereClause: { [key: string]: unknown } = {};

  const {
    values: { ownerId },
  } = requestContext;

  // Filtro principal
  whereClause.id_cliente = customerId;

  // Seguridad: Siempre verificar ownerId cuando aplique
  if (ownerId) {
    whereClause.id_propietario = ownerId;
  }

  const rows = await CustomerusersModel.findAll({
    order: [['createdAt', 'DESC']],
    attributes: ['id', 'id_usuario', 'id_cliente'],
    where: whereClause,
    include: [
      { model: UserModel, attributes: ['nombre'] },
      { model: CustomerModel, attributes: ['denominacion'] },
    ],
  });

  return rows.map(({ id, id_usuario, id_cliente, User, Customer }) =>
    Customerusers.create({
      id,
      id_usuario,
      id_cliente,
      userName: User?.nombre.toString() ?? '',
      customerName: Customer?.denominacion.toString() ?? '',
    }),
  );
}
```

### Paso 2: Crear Caso de Uso para Obtener Datos por IDs

En el dominio que contiene los datos finales (Users), crear un caso de uso que reciba un array de IDs.

**Archivo**: `packages/server/src/domains/Users/Application/UseCases/GetEmailsByUsersId.usecase.ts`

```typescript
import { IUseCase } from '@server/Application';
import { UserRepository, IGetEmailsByUsersId } from '../../Domain';

export class GetEmailsByUsersId implements IUseCase<string[]> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({
    input,
    requestContext,
  }: IGetEmailsByUsersId): Promise<string[]> {
    return await this.userRepository.getEmailsByUsersId({
      userIds: input,
      requestContext,
    });
  }
}
```

**Interfaz**: `packages/server/src/domains/Users/Domain/User.interfaces.ts`

```typescript
export interface IGetEmailsByUsersId extends IRequestContext {
  input: number[];
}
```

**Repositorio**: `packages/server/src/domains/Users/Infrastructure/Database/UsersRepository.implementation.ts`

```typescript
async getEmailsByUsersId({
  userIds,
  requestContext,
}: IGetEmailsByUsersIdRepository): Promise<string[]> {
  const {
    values: { ownerId },
  } = requestContext;

  const whereClause: { [key: string]: unknown } = {
    id: userIds,
  };

  if (ownerId) {
    whereClause.id_propietario = ownerId;
  }

  const users = await UserModel.findAll({
    attributes: ['email'],
    where: whereClause,
  });

  return users
    .map((user) => user.email)
    .filter((email) => email && email.trim() !== '');
}
```

### Paso 3: Inyectar y Usar los Casos de Uso

En el dominio que necesita los datos (Recipt), inyectar ambos casos de uso.

**Inyección en constructor**:

```typescript
export class CreateRecipt implements IUseCase<IRecipt> {
  constructor(
    private readonly reciptRepository: ReciptRepository,
    private readonly _getAllUsersByCustomerId: GetAllUsersByCustomerId,
    private readonly _getEmailsByUsersId: GetEmailsByUsersId,
    // ... otros casos de uso
  ) {}
```

**Uso en el método execute**:

```typescript
async execute({ input, requestContext }: ICreateRecipt): Promise<IRecipt> {
  // ... lógica previa ...

  // Paso 1: Obtener las relaciones (customerUsers)
  const customerUsers = await executeUseCase({
    useCase: this._getAllUsersByCustomerId,
    input: { customerId: input.clientId },
    requestContext,
  });

  // Paso 2: Extraer los IDs de usuarios
  const userIds = customerUsers.map((cu) => cu.values.id_usuario);

  // Paso 3: Obtener los datos específicos (emails)
  const userEmails = userIds.length > 0
    ? await executeUseCase({
        useCase: this._getEmailsByUsersId,
        input: userIds,
        requestContext,
      })
    : [];

  // Paso 4: Usar los datos obtenidos
  const ccEmails = user.mail ? [user.mail, ...userEmails] : userEmails;

  await this.emailService.sendReciptConfirmation({
    recipt: newRecipt,
    clientName: customer.values.denominacion,
    clientEmail: customer.values.e_mail,
    cc: ccEmails,
  });

  return newRecipt;
}
```

### Paso 4: Registrar en el Contenedor de DI

**En el dominio que expone los casos de uso** (`Customeruserss/customerusers.app.ts`):

```typescript
export const customerusersApp = {
  customeruserssRepository: asClass(CustomeruserssRepositoryImplementation),
  customeruserssService: asClass(CustomeruserssService),
  customeruserssController: asClass(CustomeruserssController),
  _getAllUsersByCustomerId: asClass(GetAllUsersByCustomerId),
  // ... otros casos de uso
};
```

**En el dominio de Users** (`Users/user.app.ts`):

```typescript
export const userApp = {
  usersRepository: asClass(UsersRepositoryImplementation),
  usersService: asClass(UsersService),
  usersController: asClass(UsersController),
  _getEmailsByUsersId: asClass(GetEmailsByUsersId),
  // ... otros casos de uso
};
```

**En el dominio que los consume** (`Recipt/recipt.app.ts`):

```typescript
import { GetAllUsersByCustomerId } from '@server/domains/Customeruserss';
import { GetEmailsByUsersId } from '@server/domains/Users';

export const reciptApp = {
  reciptRepository: asClass(ReciptRepositoryImplementation),
  reciptService: asClass(ReciptService),
  reciptController: asClass(ReciptController),
  _createRecipt: asClass(CreateRecipt),
  _getAllUsersByCustomerId: asClass(GetAllUsersByCustomerId),
  _getEmailsByUsersId: asClass(GetEmailsByUsersId),
  // ... otros casos de uso
};
```

## Ventajas de Este Patrón

### ✅ Beneficios

1. **Desacoplamiento**: Los dominios no dependen directamente de repositorios externos
2. **Reutilización**: Los casos de uso pueden ser utilizados por múltiples dominios
3. **Testabilidad**: Fácil crear mocks de los casos de uso inyectados
4. **Seguridad**: El `requestContext` se propaga automáticamente, respetando `ownerId` y permisos
5. **Mantenibilidad**: Cambios en la implementación no afectan a otros dominios
6. **Trazabilidad**: Cada uso de `executeUseCase` queda registrado en logs

### ❌ Anti-patrones a Evitar

1. **NO acceder directamente a repositorios de otros dominios**:

```typescript
// ❌ INCORRECTO
import { UsersRepository } from '@server/domains/Users';

constructor(
  private readonly usersRepository: UsersRepository // ❌ Mal
) {}
```

2. **NO importar modelos de base de datos de otros dominios**:

```typescript
// ❌ INCORRECTO
import { UserModel } from '@server/domains/Users/Infrastructure';

// No usar UserModel directamente desde otro dominio
```

3. **NO crear queries complejas que unan múltiples dominios en un solo repositorio**:

```typescript
// ❌ INCORRECTO
const data = await CustomerModel.findAll({
  include: [
    {
      model: UserModel,
      include: [
        { model: ProfileModel }, // Múltiples niveles de Join
      ],
    },
  ],
});
```

## Casos de Uso Comunes

### 1. Obtener Datos por Array de IDs

**Cuando tengas**: Una lista de IDs de entidades de otro dominio

**Crear**: Un caso de uso que reciba `number[]` y devuelva los datos necesarios

```typescript
// GetEmailsByUsersId, GetArticlesByIds, etc.
export interface IGetDataByIds extends IRequestContext {
  input: number[];
}
```

### 2. Validar Existencia Entre Dominios

**Cuando necesites**: Verificar si una entidad existe antes de crear una relación

**Crear**: Un caso de uso que devuelva la entidad o null

```typescript
export class GetCustomerRecpt implements IUseCase<Customer | null> {
  async execute({ input, requestContext }): Promise<Customer | null> {
    return await this.customerRepository.getCustomer({
      id: input.customerId,
      requestContext,
    });
  }
}
```

### 3. Obtener Relaciones Sin Paginación

**Cuando necesites**: Todos los registros relacionados para procesarlos

**Devolver**: Array directo sin `IPaginationResponse`

```typescript
// ✅ Para relaciones
async execute(): Promise<Entity[]> {
  return await this.repository.getAll();
}

// ✅ Para listados con UI
async execute(): Promise<IPaginationResponse<Entity[]>> {
  return await this.repository.getAll();
}
```

### 4. Pasar Datos de un Dominio a Través de Otro

**Cuando necesites**: Datos de un dominio (Ownersys) para usarlos en otro contexto (Email)

**Patrón**: Obtener la entidad completa y extraer solo los datos necesarios

```typescript
// En CreateRecipt.usecase.ts
async execute({ input, requestContext }: ICreateRecipt): Promise<IRecipt> {
  // Obtener datos del propietario
  const ownersys = await executeUseCase({
    useCase: this._getOwnersys,
    input: ownerId,
    requestContext,
  });

  // ... crear el recipt ...

  // Pasar datos específicos al servicio de email
  await this.emailService.sendReciptConfirmation({
    recipt: newRecipt,
    clientName: customer.values.denominacion,
    clientEmail: customer.values.e_mail,
    companyLogo: ownersys.values.logo,        // ✅ Dato extraído
    companyName: ownersys.values.denominacion, // ✅ Dato extraído
    cc: ccEmails,
  });

  return newRecipt;
}
```

**Ventajas de este approach**:

- No se expone toda la entidad, solo los datos necesarios
- El servicio receptor no depende del dominio origen
- Fácil de testear con mocks
- Cambios en la entidad origen no afectan al receptor

## Errores Comunes y Soluciones

### Error: Property does not exist on type

```typescript
// ❌ INCORRECTO - Intentar extraer del requestContext lo que no está
const { values: { customerId } } = requestContext;
// Error: Property 'customerId' does not exist

// ✅ CORRECTO - Pasar como parámetro directo
async getAllCustomeruserssByCustomerId({
  customerId,  // ✅ Parámetro explícito
  requestContext,
}: IGetCustomeruserssByCustomerIdRepository): Promise<Customerusers[]>
```

### Error: Type has no properties in common

```typescript
// ❌ INCORRECTO - Usar objeto que no coincide con la interfaz
return await this.repository.method({
  filters: input, // Error si la interfaz no espera 'filters'
  requestContext,
});

// ✅ CORRECTO - Crear interfaz específica del repositorio
export interface ISpecificRepository extends IRequestContext {
  customerId: number; // Parámetro directo
}

return await this.repository.method({
  customerId: input.customerId, // ✅ Coincide con la interfaz
  requestContext,
});
```

## Checklist de Implementación

Cuando necesites relacionar dominios:

### Interfaces y Tipos

- [ ] ¿La interfaz del caso de uso está definida en `Domain/[Domain].interfaces.ts`?
- [ ] ¿Creaste una interfaz específica del repositorio si la firma no coincide con las existentes?
- [ ] ¿Los tipos de parámetros coinciden entre caso de uso y repositorio?
- [ ] ¿Se importó la interfaz del repositorio en la implementación?

### Caso de Uso

- [ ] ¿El caso de uso está en `Application/UseCases` del dominio que posee los datos?
- [ ] ¿El caso de uso pasa los parámetros correctamente al repositorio?
- [ ] ¿El caso de uso está exportado en `Application/UseCases/index.ts`?

### Repositorio

- [ ] ¿El método está agregado a la interfaz del repositorio en `Domain/[Domain].repository.ts`?
- [ ] ¿La implementación está en `Infrastructure/Database/[Domain]Repository.implementation.ts`?
- [ ] ¿Se valida `ownerId` en el repositorio cuando corresponde (multi-tenant)?
- [ ] ¿Los filtros de seguridad están aplicados correctamente?

### Inyección de Dependencias

- [ ] ¿El caso de uso está registrado en el contenedor DI del dominio origen (`[domain].app.ts`)?
- [ ] ¿El dominio consumidor importa el caso de uso del dominio correcto?
- [ ] ¿El caso de uso está registrado en el contenedor DI del dominio consumidor?
- [ ] ¿El caso de uso está inyectado en el constructor del consumidor?

### Invocación

- [ ] ¿Se usa `executeUseCase` para invocarlo?
- [ ] ¿Se propaga correctamente el `requestContext`?
- [ ] ¿Los parámetros se extraen correctamente del input?

### Testing y Validación

- [ ] ¿Compiló TypeScript sin errores?
- [ ] ¿Se probó con datos reales?
- [ ] ¿Los logs muestran la ejecución correcta?

## Mejores Prácticas de Seguridad

### 1. Siempre Validar ownerId

En sistemas multi-tenant, **SIEMPRE** validar que los datos pertenecen al propietario correcto:

```typescript
// ✅ CORRECTO
async getDataByCustomerId({
  customerId,
  requestContext,
}: IGetDataRepository): Promise<Data[]> {
  const whereClause: { [key: string]: unknown } = {
    id_cliente: customerId,
  };

  const { values: { ownerId } } = requestContext;

  // Validación de seguridad
  if (ownerId) {
    whereClause.id_propietario = ownerId;
  }

  return await DataModel.findAll({ where: whereClause });
}

// ❌ INCORRECTO - Sin validación de propietario
async getDataByCustomerId({
  customerId,
}: IGetDataRepository): Promise<Data[]> {
  return await DataModel.findAll({
    where: { id_cliente: customerId } // ⚠️ Puede acceder a datos de otros propietarios
  });
}
```

### 2. Filtrar Datos Sensibles

Al pasar datos entre dominios, exponer solo lo necesario:

```typescript
// ✅ CORRECTO - Solo exponer emails
async getEmailsByUsersId(): Promise<string[]> {
  const users = await UserModel.findAll({
    attributes: ['email'], // Solo el campo necesario
    where: whereClause,
  });

  return users
    .map(user => user.email)
    .filter(email => email && email.trim() !== '');
}

// ❌ INCORRECTO - Exponer entidades completas
async getUsersByIds(): Promise<User[]> {
  return await UserModel.findAll({
    // Devuelve passwords, tokens, etc.
  });
}
```

### 3. Validar Existencia Antes de Relacionar

```typescript
// ✅ CORRECTO
const customer = await executeUseCase({
  useCase: this._getCustomerRecpt,
  input: { customerId: input.clientId },
  requestContext,
});

if (!customer) {
  throw new AppError('Cliente no encontrado', 404);
}
```

## Resumen

El patrón de relaciones entre dominios se basa en:

1. **Exponer funcionalidad** a través de casos de uso específicos
2. **Inyectar** esos casos de uso donde se necesiten
3. **Invocar** usando `executeUseCase` con propagación de contexto
4. **Componer** la lógica de negocio en la capa de aplicación

Este approach mantiene la arquitectura limpia, los dominios desacoplados y facilita el testing y mantenimiento del código.
