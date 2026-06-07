# Skill: qa-runner

## Propósito

Guía al agente `@blendverse.qa` en la generación de tests, ejecución de validación estática (TypeScript + ESLint + Vitest + estructura de carpetas) y la generación del reporte `memory/{task_id}/03_qa_report.md`.

---

## Secuencia de Validación

### 0. Generación de Archivos de Test

Para cada dominio en `affected_files`, crear los archivos `.spec.ts` faltantes usando los **Templates de Test** al final de esta skill. No sobreescribir tests existentes.

**Archivos a generar por dominio:**

| Tipo               | Ruta del archivo de test                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------ |
| Entidad (backend)  | `packages/server/src/domains/{Domain}/Domain/{Entity}.entity.spec.ts`                      |
| Use Case (backend) | `packages/server/src/domains/{Domain}/Application/UseCases/Create{Entity}.usecase.spec.ts` |
| Hook (frontend)    | `packages/app/src/Domains/{Domain}/Hooks/useGet{Entities}.spec.ts`                         |

### 1. Compilación TypeScript

Ejecutar según el scope detectado en `02_dev_log.md → affected_files`:

```bash
# Si hay archivos en packages/server/
cd packages/server && npx tsc --noEmit 2>&1

# Si hay archivos en packages/app/
cd packages/app && npx tsc --noEmit 2>&1
```

**Criterio:** `status: PASS` solo si la salida no contiene `error TS`.

### 2. Linting

```bash
pnpm lint 2>&1
```

**Criterio:** `status: PASS` solo si no hay errores (warnings son aceptables, los errores no).

### 3. Ejecutar Tests con Vitest

```bash
# Si hay archivos en packages/server/
cd packages/server && npx vitest run 2>&1

# Si hay archivos en packages/app/
cd packages/app && npx vitest run 2>&1
```

**Criterio:** `status: PASS` solo si todos los tests pasan (0 failed).

### 4. Verificación de Estructura de Carpetas

Para cada archivo en `affected_files`, verificar que se encuentra en la capa correcta.

**Backend — estructura esperada:**

```
domains/{domain}/
  Domain/
    {Entity}.entity.ts
    {Entity}.interfaces.ts
    {Entity}.repository.ts
    index.ts
  Application/
    UseCases/
      GetAll{Entities}.usecase.ts
      Get{Entity}.usecase.ts
      Create{Entity}.usecase.ts
      Update{Entity}.usecase.ts
      Delete{Entity}.usecase.ts
      index.ts
    {Domain}.service.ts
    index.ts
  Infrastructure/
    Controllers/{Domain}.controller.ts
    Database/
      {Entity}.model.ts
      {Entity}Repository.implementation.ts
    Routes/{Domain}.routes.ts
  {domain}.app.ts
  index.ts
```

**Frontend — estructura esperada:**

```
Domains/{Domain}/
  {Entity}.entity.ts
  {Domain}.service.ts
  {Domain}.routes.tsx
  {Domain}.router.tsx
  Hooks/
    useCache{Entities}.ts
    useGet{Entities}.ts
    useGet{Entity}.ts
    useAdd{Entity}.ts
    useUpdate{Entity}.ts
    useDelete{Entity}.ts
    index.ts
  Components/index.ts
  Pages/
    {Entity}List.page.tsx
    {Entity}New.page.tsx
    {Entity}Update.page.tsx
```

**Criterio:** Marcar cada archivo como ✅ (en lugar correcto) o ❌ (incorrecto o faltante).

### 5. Determinación del Status Final

| Condición                                                             | Status |
| --------------------------------------------------------------------- | ------ |
| tsc sin errores + linter sin errores + tests OK + estructura correcta | `PASS` |
| Cualquier error de tsc                                                | `FAIL` |
| Cualquier error de linter (no warning)                                | `FAIL` |
| Cualquier test fallado                                                | `FAIL` |
| Archivo en capa incorrecta                                            | `FAIL` |

---

## Template Obligatorio — `03_qa_report.md`

> **Regla de brevedad:** Si el resultado es `PASS`, omitir el output de terminal — solo registrar el estado de cada paso. Si el resultado es `FAIL`, incluir únicamente el error concreto (mensaje + archivo + línea) del paso que falló, no el output completo.

```markdown
---
task_id: 'TASK-YYYYMMDD-N'
agent: 'QA_Agent'
status: 'PASS' # PASS | FAIL
attempts: 1
date: 'YYYY-MM-DD'
---

# Reporte de QA — [Título de la Tarea]

## Resultado General: ✅ PASS / ❌ FAIL

| Paso          | Comando             | Paquete(s)           | Estado      |
| ------------- | ------------------- | -------------------- | ----------- |
| 1. TypeScript | `npx tsc --noEmit`  | server / app / ambos | ✅ / ❌     |
| 2. Linting    | `pnpm lint`         | raíz del monorepo    | ✅ / ❌     |
| 3. Tests      | `npx vitest run`    | server / app / ambos | ✅ X passed |
| 4. Estructura | verificación manual | —                    | ✅ / ❌     |

---

## Error (solo si status: FAIL)

**Paso fallido:** [1 / 2 / 3 / 4]

**Error:**
```

[Copiar únicamente el mensaje de error relevante — máximo 20 líneas]

```

**Archivo afectado:** `ruta/al/archivo.ts` — línea X
```

**Acción esperada:** [Descripción concisa de qué debe corregirse]

````

---

## Templates de Test

### Backend — Entidad (`{Entity}.entity.spec.ts`)

```typescript
import { describe, it, expect } from 'vitest';
import { {Entity} } from '@server/domains/{Domain}/Domain/{Entity}.entity';

describe('{Entity} entity', () => {
  const validProps = {
    // TODO: completar con los atributos de la entidad
    id_propietario: 'owner-1',
  };

  describe('static create()', () => {
    it('should create a valid entity with required fields', () => {
      const entity = {Entity}.create(validProps);
      expect(entity).toBeDefined();
      expect(entity.values.id_propietario).toBe(validProps.id_propietario);
    });

    it('get values() should return all fields', () => {
      const entity = {Entity}.create(validProps);
      const values = entity.values;
      expect(values).toMatchObject(validProps);
    });
  });

  describe('toJSON()', () => {
    it('should return a plain object', () => {
      const entity = {Entity}.create(validProps);
      const json = entity.toJSON();
      expect(json).toMatchObject(validProps);
      expect(json).not.toBeInstanceOf({Entity});
    });
  });
});
````

### Backend — Use Case (`Create{Entity}.usecase.spec.ts`)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Create{Entity}UseCase } from '@server/domains/{Domain}/Application/UseCases/Create{Entity}.usecase';
import type { I{Entity}Repository } from '@server/domains/{Domain}/Domain/{Entity}.repository';

const mockRepository: I{Entity}Repository = {
  create: vi.fn(),
  getAll: vi.fn(),
  get: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('Create{Entity}UseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should call repository.create() with correct data', async () => {
    const useCase = new Create{Entity}UseCase(mockRepository);
    const input = {
      // TODO: completar con los campos requeridos por ICreate{Entity}
      id_propietario: 'owner-1',
    };

    await useCase.execute(input);

    expect(mockRepository.create).toHaveBeenCalledOnce();
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ id_propietario: 'owner-1' })
    );
  });

  it('should return the created entity data', async () => {
    vi.mocked(mockRepository.create).mockResolvedValue(undefined);
    const useCase = new Create{Entity}UseCase(mockRepository);
    await expect(useCase.execute({ id_propietario: 'owner-1' })).resolves.not.toThrow();
  });
});
```

### Frontend — Hook (`useGet{Entities}.spec.ts`)

```typescript
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useGet{Entities} } from '@app/Domains/{Domain}/Hooks/useGet{Entities}';

vi.mock('@app/Domains/{Domain}/{Domain}.service', () => ({
  {domain}Service: {
    useQuery: vi.fn(() => ({
      useQuery: vi.fn().mockReturnValue({ data: [], isLoading: false, isError: false }),
    })),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useGet{Entities}', () => {
  it('should return loading state initially', () => {
    const { result } = renderHook(() => useGet{Entities}({ id_propietario: 'owner-1' }), {
      wrapper: createWrapper(),
    });
    expect(result.current).toBeDefined();
  });
});
```

---

## Reglas de Calidad

1. **Pegar el output completo del terminal** — no resumir ni truncar los errores.
2. **Sección "Tests (Vitest)"** es obligatoria aunque `status: PASS`.
3. **Si `status: FAIL`**, la sección "Contexto para el Coder" es obligatoria.
4. **`attempts`** comienza en `1` y se incrementa en cada re-ejecución.
5. **No sobreescribir** archivos `.spec.ts` ya existentes — solo crear los faltantes.
6. **Si `attempts >= 3`**, no escribir el reporte — ejecutar el Protocolo Break-Loop definido en `@blendverse.qa`.
