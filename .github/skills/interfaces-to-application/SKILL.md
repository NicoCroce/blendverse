---
name: interfaces-to-application
description: Migra los DTOs de Input/Output de un dominio del server desde `Domain/[entity].interfaces.ts` hacia `Application/[domain].types.ts`, convirtiendo las interfaces manuales al patrón z.infer<typeof Schema>. Actualiza todos los imports afectados y verifica que no haya errores TypeScript antes de avanzar al siguiente dominio. Usar como parte del flujo del agente @arch-fixer o cuando se detecte un desvío B1 en arch-audit.
---

# Interfaces to Application

## ⚠️ CONTROL DE CONTEXTO (ESTRICTO)

- **UN DOMINIO A LA VEZ.** Nunca proceses dos dominios en paralelo.
- **VERIFICACIÓN OBLIGATORIA** con `diagnostics/getErrors` antes de avanzar al siguiente dominio.
- Solo modificás archivos dentro de `packages/server/src/domains/[Domain]/`.
- Si el dominio **no tiene** `Domain/[entity].interfaces.ts`, reportar "sin desvío" y saltar.

## Herramientas Requeridas

- `read/readFile` — Leer interfaces, controllers, use cases, service, app.ts
- `edit/editFiles` — Crear `Application/[domain].types.ts` y actualizar imports
- `search/searchInFiles` — Buscar todas las ocurrencias del import viejo
- `diagnostics/getErrors` — Verificar que no haya errores TS al finalizar el dominio

---

## Protocolo por Dominio

### Paso 0 — Verificación previa

1. Verificar que existe `Domain/[entity].interfaces.ts`. Si no existe: reportar "sin desvío" y terminar.
2. Leer el archivo completo.
3. Leer `Infrastructure/Controllers/[Domain].controller.ts` para identificar los Zod schemas existentes.
4. Leer `Application/[Domain].service.ts` para ver qué tipos usa.
5. Leer todos los `Application/UseCases/*.usecase.ts` para ver los imports de interfaces.
6. Leer `[domain].app.ts` para contexto de imports.

Presentar al usuario:

```
Dominio: [Domain]
Archivo origen: Domain/[entity].interfaces.ts
Archivo destino: Application/[domain].types.ts
Interfaces encontradas: IGetAll, ICreate, IGetById, IUpdate, IDelete, ...
Zod schemas en controller: CreateSchema, UpdateSchema, ...
¿Confirmás la migración? (s/n)
```

### Paso 1 — Crear `Application/[domain].types.ts`

Reglas de conversión:

| Caso                                           | Antes (interfaces.ts)                                                                     | Después (types.ts)                                                                                                             |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Input es objeto y hay Zod schema en controller | `interface ICreate extends IRequestContext { input: { field: string } }`                  | `export const CreateSchema = z.object({...}); export type ICreate = IRequestContext & { input: z.infer<typeof CreateSchema> }` |
| Input es primitivo (`number`, `string`)        | `interface IGet extends IRequestContext { input: number }`                                | `export type IGet = IRequestContext & { input: number }` (inline, sin schema)                                                  |
| Output/Response type (no es input de use case) | `interface IExecuteResponse { token: string; user: ... }`                                 | Mantener como `export type IExecuteResponse = { token: string; user: ... }`                                                    |
| Input con paginación                           | `interface IGetAll extends IRequestContext { input?: { search?: string } & IPagination }` | Derivar de schema + `& IPagination`                                                                                            |

**Template del archivo generado:**

```typescript
import { IRequestContext, IPagination } from '@server/Application';
import z from 'zod';

// ─── Schemas (fuente de verdad) ────────────────────────────────────────────
// Copiar/mover los schemas desde el Controller si ya existen,
// o crear nuevos schemas que coincidan con la validación del controller.

export const CreateEntitySchema = z.object({
  field1: z.string().min(1),
  field2: z.number(),
});

export const UpdateEntitySchema = z.object({
  id: z.number(),
  field1: z.string().min(1),
});

// ─── Tipos derivados ────────────────────────────────────────────────────────
export type IGetAllEntities = IRequestContext & {
  input?: { search?: string } & IPagination;
};
export type ICreateEntity = IRequestContext & {
  input: z.infer<typeof CreateEntitySchema>;
};
export type IGetEntity = IRequestContext & { input: number };
export type IUpdateEntity = IRequestContext & {
  input: z.infer<typeof UpdateEntitySchema>;
};
export type IDeleteEntity = IRequestContext & { input: number };

// ─── Response types ─────────────────────────────────────────────────────────
// (Solo si el dominio tiene tipos de respuesta que no son la entidad en sí)
```

### Paso 2 — Actualizar `Application/index.ts`

Agregar el export del nuevo archivo de tipos:

```typescript
export * from './[domain].types';
```

### Paso 3 — Actualizar imports en todos los archivos del dominio

Buscar con `searchInFiles` la cadena `from '../../Domain'` o `from '../Domain'` dentro del dominio, filtrando por `*.usecase.ts`, `*.service.ts`.

Para cada ocurrencia que importe una interfaz (ej. `ICreateEntity`):

- Cambiar el import para que apunte a `'../[domain].types'` (desde usecase) o `'./[domain].types'` (desde service).

**Imports que NO cambian:**

- `import { Entity } from '../../Domain/Entity.entity'` → permanece en Domain
- `import { EntityRepository } from '../../Domain/Entity.repository'` → permanece en Domain
- `import { AppError, IUseCase } from '@server/Application'` → permanece igual

### Paso 4 — Actualizar `Domain/index.ts`

Remover el export del archivo de interfaces eliminado:

```typescript
// Eliminar esta línea:
export * from './[Entity].interfaces';
```

### Paso 5 — Eliminar `Domain/[entity].interfaces.ts`

Solo después de que todos los imports en el paso 3 estén actualizados correctamente.

```bash
rm packages/server/src/domains/[Domain]/Domain/[entity].interfaces.ts
```

### Paso 6 — Verificación

```bash
# Verificar solo el dominio procesado
diagnostics/getErrors en packages/server/src/domains/[Domain]/
```

Si hay errores de TypeScript:

1. Leer el error exacto.
2. Corregir el import o tipo indicado.
3. Volver a ejecutar `diagnostics/getErrors`.
4. Máximo 3 intentos de corrección. Si persisten: reportar al usuario con detalle y detenerse.

### Paso 7 — Reporte parcial

```
✅ [Domain]: interfaces.ts migrado a Application/[domain].types.ts
   - Interfaces migradas: IGetAll, ICreate, IGet, IUpdate, IDelete
   - Schemas creados: CreateEntitySchema, UpdateEntitySchema
   - Archivos actualizados: 4 use cases, 1 service
   - TS errors: 0
```

---

## Qué NO hacer

- ❌ No eliminar `[entity].interfaces.ts` antes de actualizar todos los imports.
- ❌ No inventar Zod schemas si no hay validación previa — usar el tipo inline en ese caso.
- ❌ No modificar `Domain/[Entity].entity.ts` ni `Domain/[Entity].repository.ts`.
- ❌ No tocar archivos de Infrastructure ni de otros dominios.
