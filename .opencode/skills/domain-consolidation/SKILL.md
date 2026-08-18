---
name: domain-consolidation
description: Extrae la lógica DI (Awilix) del `index.ts` de cada dominio del server hacia un archivo `[domain].di.ts` dedicado, dejando `index.ts` como barrel puro (solo re-exports). Actualiza el `index.ts` para que re-exporte desde `[domain].di.ts`. Usar como parte del flujo del agente @blendverse-arch-fixer o cuando se detecte un desvío B3 en arch-audit.
---

# Domain Consolidation

## Principio

`index.ts` es un **barrel puro** — solo contiene `export *` statements.
Toda lógica de registro DI (Awilix) y helpers de container vive en `[domain].di.ts`.

## ⚠️ CONTROL DE CONTEXTO (ESTRICTO)

- **UN DOMINIO A LA VEZ.** Verificar TypeScript antes de avanzar al siguiente.
- Solo modificás archivos dentro de `packages/server/src/domains/[Domain]/`.
- `register.ts` **no cambia**: sigue importando desde `'./[Domain]'` (que re-exporta desde `.di.ts`).
- Si `index.ts` ya es un barrel puro (sin lógica), reportar "sin desvío" y saltar.

## Herramientas Requeridas

- `read/readFile` — Leer `index.ts`
- `edit/editFiles` — Crear `[domain].di.ts` y actualizar `index.ts`
- `diagnostics/getErrors` — Verificar que no haya errores TS al finalizar

---

## Protocolo por Dominio

### Paso 0 — Verificación previa

1. Leer `index.ts` del dominio.
2. Verificar si contiene lógica (imports de `awilix`, definición de `[domainApp]`, helpers `container.resolve`).
3. Si no hay lógica → reportar "sin desvío" y saltar.

### Paso 1 — Crear `[domain].di.ts`

Crear `packages/server/src/domains/[Domain]/[domain].di.ts` con toda la lógica extraída de `index.ts`:

```typescript
import { asClass } from 'awilix';
import { EntityService } from './Application';
import {
  EntityController,
  EntityRepositoryImplementation,
} from './Infrastructure';
import {
  CreateEntity,
  GetAllEntities,
  GetEntity,
  UpdateEntity,
  DeleteEntity,
} from './Application';
import { container } from '@server/Infrastructure/di/Container';

export const [domainApp] = {
  entityRepository: asClass(EntityRepositoryImplementation),
  entityService: asClass(EntityService),
  entityController: asClass(EntityController),
  _createEntity: asClass(CreateEntity),
  // ... copiar todos los registros exactos del index.ts original
};

// Helper de resolución (solo si existía en index.ts)
export const entityController = () =>
  container.resolve<EntityController>('entityController');
```

> **Importante:** copiar el bloque exacto del `index.ts` original, incluyendo todos los imports. No inventar registros.

### Paso 2 — Actualizar `index.ts` como barrel puro

Reemplazar todo el contenido del `index.ts` por:

```typescript
export * from './Application';
export * from './Domain';
export * from './Infrastructure';
export * from './[domain].di';
```

> Solo incluir las capas que existan en el dominio (`Application`, `Domain`, `Infrastructure`).

### Paso 3 — Verificación

```bash
diagnostics/getErrors en packages/server/src/domains/[Domain]/
```

Si hay errores de TypeScript:

1. Leer el error exacto.
2. El más común será un import faltante en `[domain].di.ts` — corregir el path.
3. Volver a ejecutar `diagnostics/getErrors`.
4. Máximo 3 intentos. Si persisten: reportar al usuario con detalle y detenerse.

### Paso 4 — Reporte parcial

```
✅ [Domain]: lógica DI extraída a [domain].di.ts / index.ts es barrel puro
   - Registros DI movidos: N clases
   - index.ts: solo export * (4 líneas)
   - register.ts: sin cambios (sigue importando desde './[Domain]')
   - TS errors: 0
```

---

## Qué NO hacer

- ❌ No poner lógica en `index.ts` — ni imports con side effects, ni funciones, ni objetos.
- ❌ No cambiar los nombres de los registros DI (ej. `userRepository` sigue siendo `userRepository`).
- ❌ No modificar `register.ts` — los exports llegan via barrel.
- ❌ No tocar otros archivos de Infrastructure ni use cases.
