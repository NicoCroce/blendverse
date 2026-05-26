# Skill: test-generator

## Propósito

Guía al agente `@tester` en el análisis de reglas de negocio y la generación de tests completos (no stubs) para las cuatro capas de un dominio DDD: Entity, Use Case, Service y Controller en el backend, y Hooks en el frontend.

---

## Protocolo de Análisis de Reglas de Negocio

Antes de escribir un solo test, leer los archivos fuente y responder estas preguntas por capa:

### Capa Domain — Entity

| Pregunta                                          | Dónde buscar                                |
| ------------------------------------------------- | ------------------------------------------- |
| ¿Qué campos son requeridos?                       | Constructor de la clase + `static create()` |
| ¿Qué campos son opcionales?                       | Parámetros con `?` o con valor por defecto  |
| ¿Hay validaciones en el constructor?              | Lógica dentro del constructor               |
| ¿`values` devuelve exactamente los mismos campos? | Getter `get values()`                       |
| ¿Hay transformaciones en `toJSON()`?              | Método `toJSON()`                           |

### Capa Application — Use Cases

| Pregunta                                          | Dónde buscar                                     |
| ------------------------------------------------- | ------------------------------------------------ |
| ¿Qué dependencias inyecta el constructor?         | `constructor(private readonly ...)`              |
| ¿Qué método del repositorio llama y con qué args? | Cuerpo de `execute()`                            |
| ¿Propaga `ownerId` del `requestContext`?          | Verificar `params.requestContext.values.ownerId` |
| ¿Qué devuelve si el recurso no existe?            | Bloque `if (!result)` o `throw`                  |
| ¿Qué errores lanza y con qué código HTTP?         | `throw new AppError(...)`                        |

### Capa Application — Service

| Pregunta                                                        | Dónde buscar                    |
| --------------------------------------------------------------- | ------------------------------- |
| ¿Qué use cases inyecta?                                         | Constructor del service         |
| ¿Llama a `executeUseCase` o directamente a `useCase.execute()`? | Cuerpo de cada método           |
| ¿Qué campos del input loguea en `inputLog`?                     | Segundo arg de `executeUseCase` |

### Capa Infrastructure — Controller

| Pregunta                                   | Dónde buscar                       |
| ------------------------------------------ | ---------------------------------- |
| ¿Qué schema Zod usa para validar el input? | `procedure.input(z.object({...}))` |
| ¿Qué campos son obligatorios en el schema? | Campos sin `.optional()`           |
| ¿Qué responde al cliente?                  | `return` del handler               |
| ¿Escribe en `res.cookie()`?                | Llamadas a `ctx.res.cookie(...)`   |
| ¿Usa `procedure` o `protectedProcedure`?   | Declaración del procedure          |

### Capa Frontend — Hooks

| Pregunta                            | Dónde buscar                         |
| ----------------------------------- | ------------------------------------ |
| ¿Qué endpoint tRPC llama?           | `EntityService.xxx.useQuery(...)`    |
| ¿Qué parámetros pasa a la query?    | Args del hook                        |
| ¿Tiene `staleTime` o `refetchOn*`?  | Opciones del `useQuery`              |
| ¿La mutation invalida alguna query? | `queryClient.invalidateQueries(...)` |

---

## Templates de Test

> **Regla de uso:** Reemplazar **todos** los placeholders `{...}` con los valores reales del dominio antes de crear el archivo. No dejar ningún `TODO` pendiente.

---

### Template 1 — Entity (`{Entity}.entity.spec.ts`)

```typescript
import { describe, it, expect } from 'vitest';
import { {Entity} } from '@server/domains/{Domain}/Domain/{Entity}.entity';

describe('{Entity} entity', () => {
  // Completar con todos los campos requeridos extraídos del constructor
  const validProps = {
    {field1}: '{value1}',
    {field2}: {value2},
    id_propietario: 'owner-1',
  };

  describe('static create()', () => {
    it('creates a valid entity with all required fields', () => {
      const entity = {Entity}.create(validProps);
      expect(entity).toBeDefined();
      expect(entity.values.{field1}).toBe(validProps.{field1});
      expect(entity.values.id_propietario).toBe(validProps.id_propietario);
    });

    it('creates an entity without optional fields', () => {
      const { {optionalField}: _omitted, ...requiredOnly } = validProps;
      const entity = {Entity}.create(requiredOnly as typeof validProps);
      expect(entity.values.{optionalField}).toBeUndefined();
    });
  });

  describe('get values()', () => {
    it('returns all fields as a plain object', () => {
      const entity = {Entity}.create(validProps);
      expect(entity.values).toMatchObject(validProps);
    });

    it('does not return the entity class instance', () => {
      const entity = {Entity}.create(validProps);
      expect(entity.values).not.toBeInstanceOf({Entity});
    });
  });

  describe('toJSON()', () => {
    it('returns the same structure as values', () => {
      const entity = {Entity}.create(validProps);
      expect(entity.toJSON()).toEqual(entity.values);
    });
  });
});
```

---

### Template 2 — Use Case (`{Action}{Entity}.usecase.spec.ts`)

Este template cubre el patrón estándar de los use cases del proyecto: el use case recibe `{ input, requestContext }`, delega en el repositorio y propaga el `ownerId`.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestContext, AppError } from '@server/Application';
import { {Action}{Entity} } from '@server/domains/{Domain}/Application/UseCases/{Action}{Entity}.usecase';
import type { {Entity}Repository } from '@server/domains/{Domain}/Domain/{Entity}.repository';

// Mock tipado del repositorio — usar los métodos reales de la interfaz
const mockRepository: {Entity}Repository = {
  getAll{Entities}: vi.fn(),
  get{Entity}: vi.fn(),
  create{Entity}: vi.fn(),
  update{Entity}: vi.fn(),
  delete{Entity}: vi.fn(),
};

const requestContext = new RequestContext(1, 'req-test', /* ownerId */ 10);

describe('{Action}{Entity} use case', () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Happy path ──────────────────────────────────────────────────────────
  it('delegates to the repository with the correct data', async () => {
    const expectedResult = { /* datos reales del dominio */ };
    vi.mocked(mockRepository.{repositoryMethod}).mockResolvedValue(expectedResult as never);

    const useCase = new {Action}{Entity}(mockRepository);
    const result = await useCase.execute({
      input: {
        {field1}: '{value1}',
        {field2}: {value2},
      },
      requestContext,
    });

    expect(mockRepository.{repositoryMethod}).toHaveBeenCalledOnce();
    expect(mockRepository.{repositoryMethod}).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId: 10, // ownerId propagado desde requestContext
        {field1}: '{value1}',
      }),
    );
    expect(result).toEqual(expectedResult);
  });

  // ── Multi-tenant ────────────────────────────────────────────────────────
  it('propagates ownerId from requestContext to the repository', async () => {
    vi.mocked(mockRepository.{repositoryMethod}).mockResolvedValue({} as never);
    const contextWithOwnerId99 = new RequestContext(1, 'req-test', 99);

    const useCase = new {Action}{Entity}(mockRepository);
    await useCase.execute({ input: { {field1}: '{value1}' }, requestContext: contextWithOwnerId99 });

    expect(mockRepository.{repositoryMethod}).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId: 99 }),
    );
  });

  // ── Error paths ─────────────────────────────────────────────────────────
  it('throws AppError when the entity is not found', async () => {
    // Solo aplica a use cases Get/Update/Delete
    vi.mocked(mockRepository.{repositoryMethod}).mockResolvedValue(null as never);

    const useCase = new {Action}{Entity}(mockRepository);
    await expect(
      useCase.execute({ input: {id: 999}, requestContext }),
    ).rejects.toMatchObject({ message: expect.any(String) });
  });

  it('propagates unexpected repository errors', async () => {
    vi.mocked(mockRepository.{repositoryMethod}).mockRejectedValue(new Error('DB connection lost'));

    const useCase = new {Action}{Entity}(mockRepository);
    await expect(
      useCase.execute({ input: { {field1}: '{value1}' }, requestContext }),
    ).rejects.toThrow('DB connection lost');
  });
});
```

---

### Template 3 — Service (`{Domain}.service.spec.ts`)

El service del proyecto delega siempre a través de `executeUseCase`. El test verifica esa delegación y qué campos se loguean.

```typescript
import { RequestContext, executeUseCase } from '@server/Application';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { {Domain}Service } from './{Domain}.service';

// Mockear cross-domain dependencies del service (si las hay)
vi.mock('@server/domains/{OtherDomain}', () => ({
  {OtherUseCase}: class {OtherUseCase} {},
}));

vi.mock('@server/Application', async () => {
  const actual = await vi.importActual<typeof import('@server/Application')>(
    '@server/Application',
  );
  return { ...actual, executeUseCase: vi.fn() };
});

const requestContext = new RequestContext(1, 'req-test', 10);

describe('{Domain}Service', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('{action}()', () => {
    it('delegates to the use case via executeUseCase', async () => {
      const {action}UseCase = { execute: vi.fn() };
      const expectedResponse = { /* datos reales */ };
      vi.mocked(executeUseCase).mockResolvedValue(expectedResponse);

      const service = new {Domain}Service(
        {action}UseCase as never,
        // otros use cases en orden del constructor
      );

      const response = await service.{action}({
        input: { {field1}: '{value1}' },
        requestContext,
      });

      expect(response).toBe(expectedResponse);
      expect(executeUseCase).toHaveBeenCalledWith({
        useCase: {action}UseCase,
        input: { {field1}: '{value1}' },
        requestContext,
        inputLog: {
          // solo los campos que NO son sensibles (sin passwords, tokens, etc.)
          {field1}: '{value1}',
        },
      });
    });
  });
});
```

---

### Template 4 — Controller (`{Domain}.controller.spec.ts`)

El controller tRPC usa `router` + `procedure`/`protectedProcedure`. El test usa `createCaller` para simular llamadas reales.

```typescript
import { TRPCError } from '@trpc/server';
import { RequestContext } from '@server/Application';
import { describe, it, expect, vi } from 'vitest';
import { {Domain}Controller } from './{Domain}.controller';

vi.mock('@server/Infrastructure', async () => {
  const { router, procedure, protectedProcedure } =
    await import('@server/Infrastructure/trpc/TrpcInstance.js');
  return { router, procedure, protectedProcedure };
});

import { router } from '@server/Infrastructure';

const requestContext = new RequestContext(1, 'req-test', 10);

// Construir el caller simulando el contexto tRPC real del proyecto
const buildCaller = ({action} = vi.fn()) => {
  const res = { cookie: vi.fn() };
  const controller = new {Domain}Controller({ {action} } as never);
  const {domain}Router = router({ {action}: controller.{action}() });

  return {
    {action},
    res,
    caller: {domain}Router.createCaller({
      requestContext,
      res,
    } as never),
  };
};

describe('{Domain}Controller', () => {
  // ── Happy path ───────────────────────────────────────────────────────────
  it('validates input, delegates to service and returns the result', async () => {
    const serviceResponse = { /* datos reales del dominio */ };
    const { caller, {action} } = buildCaller(
      vi.fn().mockResolvedValue(serviceResponse),
    );

    const result = await caller.{action}({
      {field1}: '{value1}',
      {field2}: {value2},
    });

    expect({action}).toHaveBeenCalledWith({
      input: { {field1}: '{value1}', {field2}: {value2} },
      requestContext,
    });
    expect(result).toMatchObject(serviceResponse);
  });

  // ── Zod validation ───────────────────────────────────────────────────────
  it('rejects invalid input before calling the service', async () => {
    const { caller, {action} } = buildCaller();

    await expect(
      caller.{action}({
        {field1}: null as never, // campo requerido enviado como null
      }),
    ).rejects.toBeInstanceOf(TRPCError);

    expect({action}).not.toHaveBeenCalled();
  });

  // ── Error mapping ────────────────────────────────────────────────────────
  it('propagates AppError from the service as TRPCError', async () => {
    const { caller } = buildCaller(
      vi.fn().mockRejectedValue(new Error('Not found')),
    );

    await expect(
      caller.{action}({ {field1}: '{value1}' }),
    ).rejects.toThrow();
  });
});
```

---

### Template 5 — Hook Query (`use{Action}{Entities}.spec.ts`)

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { use{Action}{Entities} } from '@app/Domains/{Domain}/Hooks/use{Action}{Entities}';

// Mockear el service tRPC del dominio
vi.mock('@app/Domains/{Domain}/{Domain}.service', () => ({
  {Domain}Service: {
    {endpoint}: {
      useQuery: vi.fn().mockReturnValue({
        data: [{ id: 1, {field1}: '{value1}' }],
        isLoading: false,
        isError: false,
      }),
    },
  },
}));

// Si el hook lee useURLParams, mockearlo también
vi.mock('@app/Aplication/Hooks/useURLParams', () => ({
  useURLParams: vi.fn().mockReturnValue({ searchParams: {} }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('use{Action}{Entities} hook', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls the correct tRPC endpoint', () => {
    const { result } = renderHook(() => use{Action}{Entities}(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toHaveLength(1);
  });

  it('passes search params to the query', () => {
    const { useURLParams } = vi.mocked(
      await import('@app/Aplication/Hooks/useURLParams'),
    );
    useURLParams.mockReturnValue({ searchParams: { search: 'test', page: 1 } });

    renderHook(() => use{Action}{Entities}(), { wrapper: createWrapper() });

    // Verificar que el mock del service recibió los parámetros
    const { {Domain}Service } = vi.mocked(
      await import('@app/Domains/{Domain}/{Domain}.service'),
    );
    expect({Domain}Service.{endpoint}.useQuery).toHaveBeenCalledWith(
      { search: 'test', page: 1 },
      expect.any(Object),
    );
  });
});
```

---

### Template 6 — Hook Mutation (`use{Action}{Entity}.spec.ts`)

```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { use{Action}{Entity} } from '@app/Domains/{Domain}/Hooks/use{Action}{Entity}';

const mutateMock = vi.fn();

vi.mock('@app/Domains/{Domain}/{Domain}.service', () => ({
  {Domain}Service: {
    {endpoint}: {
      useMutation: vi.fn().mockReturnValue({
        mutateAsync: mutateMock,
        isPending: false,
        isError: false,
      }),
    },
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('use{Action}{Entity} mutation hook', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls the tRPC mutation with correct data', async () => {
    const { result } = renderHook(() => use{Action}{Entity}(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.{action}({ {field1}: '{value1}' });
    });

    expect(mutateMock).toHaveBeenCalledWith({ {field1}: '{value1}' });
  });

  it('exposes isPending state', () => {
    const { result } = renderHook(() => use{Action}{Entity}(), {
      wrapper: createWrapper(),
    });
    expect(result.current.isPending).toBe(false);
  });
});
```

---

## Mocks Cross-Domain

Cuando un use case o service depende de use cases de otro dominio, usar este patrón (basado en el dominio Auth del proyecto):

```typescript
// Patrón: importar el tipo real pero mockear la clase como vacía
vi.mock('@server/domains/{OtherDomain}', async () => {
  const { {OtherEntity} } = await import(
    '@server/domains/{OtherDomain}/Domain/{OtherEntity}.entity.js'
  );
  return {
    {OtherEntity},
    {OtherUseCase}: class {OtherUseCase} {},
  };
});

// Luego re-importar el tipo para poder instanciar objetos correctamente
import { {OtherEntity} } from '@server/domains/{OtherDomain}';
```

**Regla:** Siempre importar la **entidad** con `await import(...)` para tener acceso al tipo real, pero mockear los **use cases** como clases vacías.

---

## Verificar que los tests pasan

Una vez generados los tests, ejecutar:

```bash
# Backend
cd packages/server && npx vitest run 2>&1

# Frontend
cd packages/app && npx vitest run 2>&1
```

Todos los tests generados deben pasar (0 failed). Si alguno falla, corregirlo antes de hacer handoff a `@qa`. No se requiere flag `--coverage` ni alcanzar umbrales de porcentaje.

---

## Archivos que NO requieren tests (sin lógica de negocio)

Los siguientes archivos **no tienen lógica de negocio propia** y no deben recibir tests:

**Backend:**

- `*.model.ts` — modelos Sequelize: son declaraciones de esquema, sin comportamiento
- `*.routes.ts` — registro de rutas tRPC: solo conectan piezas, sin lógica
- `*.app.ts` — registro Awilix: configuración de DI, sin lógica
- `index.ts` — barrel exports: sin lógica

**Frontend:**

- `*.routes.tsx` / `*.router.tsx` — declaración de rutas: sin lógica
- `Pages/**` — páginas de composición: la lógica está en los hooks que usan
- `index.ts` — barrel exports: sin lógica
- Componentes puramente visuales sin estado ni validación

**Criterio de decisión:** un archivo merece test si contiene al menos una de estas condiciones:

- Validaciones de datos (Zod, condicionales sobre campos)
- Reglas de negocio (cálculos, transformaciones, restricciones)
- Propagación de contexto multi-tenant (`ownerId`)
- Llamadas a dependencias con argumentos específicos
- Manejo de errores con mensajes o códigos HTTP determinados
