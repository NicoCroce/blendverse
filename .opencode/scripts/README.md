# Scripts de Automatizacion — .opencode/scripts

Scripts TypeScript para reducir consumo de tokens y acelerar tareas mecanicas del pipeline de agentes.

## Comandos

| Comando                                                                | Descripcion                                        |
| ---------------------------------------------------------------------- | -------------------------------------------------- |
| `pnpm --filter @opencode-automation/scripts generate-back`             | Genera scaffold backend para un dominio nuevo      |
| `pnpm --filter @opencode-automation/scripts generate-front`            | Genera scaffold frontend para un dominio nuevo     |
| `pnpm --filter @opencode-automation/scripts audit-arch`                | Auditoria de arquitectura (detecta desvios)        |
| `pnpm --filter @opencode-automation/scripts validate-pipeline-state`   | Valida history, checkpoints y artefactos de tareas |
| `pnpm --filter @opencode-automation/scripts capture-pipeline-baseline` | Captura el estado de Vitest antes de implementar   |

## Uso

### generate-back

```bash
pnpm --filter @opencode-automation/scripts generate-back \
  --entity Product \
  --table productos \
  --fields "nombre:string,precio:number,activo:boolean" \
  --domain Products \
  --operations-file specs/<feature>/contracts/operations.json
```

Genera scaffold técnico:

- `Domain/`: entity, repository, index
- `Application/`: types, service, selected use cases, index
- `Infrastructure/`: controller, model, repository impl, routes, indexes
- `[domain].di.ts` y `index.ts` raiz

**Nota:** Los registros globales se actualizan de forma idempotente. El generator se niega a sobrescribir un dominio existente salvo que se use `--force` explícitamente.

### generate-front

```bash
pnpm --filter @opencode-automation/scripts generate-front \
  --entity Product \
  --server-domain Products \
  --domain Products \
  --operations-file specs/<feature>/contracts/operations.json
```

Genera scaffold técnico:

- Entity types (con `inferRouterOutputs`)
- Service tRPC
- Routes y router
- Hooks seleccionados (query, mutation, cache)
- Páginas base según `uiViews` (list, detail, new, edit)
- Componentes e indexes

**Nota:** `Routes.tsx` se actualiza de forma idempotente. El generator no implementa la UI ni la lógica de negocio definitiva.

### Operaciones CRUD

Ambos generators soportan `--operations` y `--operations-file` para especificar qué operaciones generar. En el pipeline se debe usar `--operations-file` para que backend y frontend consuman la misma fuente de verdad.

#### Operaciones validas

- `getAll` — Listar todos (con paginacion)
- `get` — Obtener por ID
- `create` — Crear nuevo registro
- `update` — Actualizar registro existente
- `delete` — Eliminar registro

#### Ejemplos

**Solo lectura:**

```bash
pnpm --filter @opencode-automation/scripts generate-back \
  --entity Report --table reportes \
  --fields "fecha:date,descripcion:string" \
  --operations getAll,get
```

**Lista + crear:**

```bash
pnpm --filter @opencode-automation/scripts generate-front \
  --entity Log --server-domain Logs \
  --operations getAll,create
```

**CRUD completo (default si no se especifica):**

```bash
pnpm --filter @opencode-automation/scripts generate-back \
  --entity Product --table productos \
  --fields "nombre:string,precio:number" \
  --operations getAll,get,create,update,delete
```

**Contrato compartido:**

```json
{
  "apiOperations": ["getAll", "get", "create"],
  "uiViews": ["list", "detail", "new"]
}
```

`uiViews` acepta `list`, `detail`, `new` y `edit`. La vista `detail` requiere la operación API `get`.

También puede definirse manualmente:

```bash
pnpm --filter @opencode-automation/scripts generate-front \
  --entity Product \
  --server-domain Products \
  --operations getAll,get,create \
  --views list,detail,new
```

### Regla de responsabilidad

Los generators crean scaffold técnico y CRUD genérico. No implementan la lógica de negocio de la feature. Después de generar, `@blendverse-back` y `@blendverse-front` deben implementar las reglas, validaciones, permisos, relaciones, formularios, estados y criterios de aceptación definidos en los artefactos de diseño.

No ejecutar el generator completo sobre un dominio existente. Para dominios existentes, los agentes modifican únicamente los archivos definidos en `tasks.md`.

#### Archivos generados segun operaciones

**Backend:**
| Operacion | Archivos |
|-----------|----------|
| `getAll` | `GetAll{Entities}.usecase.ts` |
| `get` | `Get{Entity}.usecase.ts` |
| `create` | `Create{Entity}.usecase.ts` |
| `update` | `Update{Entity}.usecase.ts` |
| `delete` | `Delete{Entity}.usecase.ts` |

**Frontend:**
| Operacion | Archivos |
|-----------|----------|
| `getAll` | `useGet{Entities}.ts`, `{Entity}List.page.tsx` |
| `get` | `useGet{Entity}.ts` |
| `create` | `useAdd{Entity}.ts`, `{Entity}New.page.tsx` |
| `update` | `useUpdate{Entity}.ts`, `{Entity}Update.page.tsx` |
| `delete` | `useDelete{Entity}.ts` |

### audit-arch

```bash
pnpm --filter @opencode-automation/scripts audit-arch        # formato tabla
pnpm --filter @opencode-automation/scripts audit-arch --json  # JSON raw
```

Detecta:

- **B1**: Tipos legacy en `Domain/` (deberian estar en `Application/`)
- **B3**: Dominios sin `.di.ts` (necesitan consolidacion)
- **B4**: Infraestructura en `Application/Utils/`
- **D1**: Frontend que no usa `inferRouterOutputs`
- Dominios no registrados, stubs incompletos

### validate-pipeline-state

```bash
pnpm --filter @opencode-automation/scripts validate-pipeline-state \
  --project-root . \
  --task-id TASK-feat-example-20260817-1
```

Valida la forma canónica de `memory/history_log.json`, task IDs duplicados,
frontmatter de reportes, checkpoints inconsistentes y bloqueos que no tienen
un `task_id` coincidente. Los bloqueos globales heredados se reportan como
warning para no destruir histórico automáticamente.

### capture-pipeline-baseline

```bash
pnpm --filter @opencode-automation/scripts capture-pipeline-baseline \
  --project-root . \
  --task-id TASK-feat-example-20260817-1 \
  --branch feat/example
```

Ejecuta las suites server/app en paralelo y escribe `memory/{task_id}/00_baseline.json`.
Los estados `TIMEOUT` y `FAIL` quedan registrados para que Tester y QA puedan
distinguir problemas preexistentes de regresiones nuevas.

## Estructura

```
.opencode/scripts/
  src/
    generators/     # back-ddd.ts, front-ddd.ts
    analyzers/      # arch-audit.ts
    migrations/     # (Fase 2: usecases, domain-consolidation, interfaces-to-app)
    validators/     # (Fase 3: qa-runner, code-reviewer)
    templates/      # Handlebars templates (.hbs)
      back/
      front/
    utils/          # naming.ts, fs.ts, ts-ast.ts
  bin/              # Entry points CLI
```

## Convenciones de templates

- Templates Handlebars (`.hbs`) con variables `{{Entity}}`, `{{Domain}}`, `{{domain}}`, `{{DOMAIN}}`
- Helpers de naming: `toPascalCase`, `toCamelCase`, `toPlural`, `toScreamingSnake`
- `ts-morph` para rewrites de imports seguros (AST-based)

## Agregar un nuevo generator

1. Crear template en `src/templates/[categoria]/nombre.hbs`
2. Crear generator en `src/generators/nombre.ts`
3. Crear entry point en `bin/nombre.ts`
4. Agregar script en `package.json`

## Estado

| Script                    | Estado       | Fase |
| ------------------------- | ------------ | ---- |
| generate-back             | Implementado | 1    |
| generate-front            | Implementado | 1    |
| audit-arch                | Implementado | 1    |
| usecases-migration        | Pendiente    | 2    |
| domain-consolidation      | Pendiente    | 2    |
| interfaces-to-application | Pendiente    | 3    |
| qa-runner                 | Pendiente    | 3    |
| code-reviewer             | Pendiente    | 4    |
