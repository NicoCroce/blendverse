# Listado de Scripts — Ejecución Manual vs. Automática

Este documento lista todos los scripts de automatización en `.opencode/scripts/` y especifica quién los ejecuta y cuándo.

## Scripts Implementados (Fase 1)

| Script                      | Descripción                                                   | Quién lo ejecuta                        | Cuándo                                         | Modo                             |
| --------------------------- | ------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------- | -------------------------------- |
| `generate-back`             | Genera scaffold backend para un dominio nuevo                 | **@blendverse-back**                    | Solo cuando `tasks.md` define un dominio nuevo | Automático (dentro del pipeline) |
| `generate-front`            | Genera scaffold frontend para un dominio nuevo                | **@blendverse-front**                   | Solo cuando `tasks.md` define un dominio nuevo | Automático (dentro del pipeline) |
| `audit-arch`                | Auditoría de arquitectura (detecta desvíos B1, B3, B4, D1)    | **Humano** o **@blendverse-arch-fixer** | Antes de correcciones arquitectónicas          | Manual (comando directo)         |
| `validate-pipeline-state`   | Valida history, checkpoints, frontmatter y bloqueos por tarea | **@blendverse-implement** o humano      | Antes de iniciar/reanudar una tarea            | Automático/manual                |
| `capture-pipeline-baseline` | Captura las suites server/app antes de implementar            | **@blendverse-implement**               | Registro inicial de tarea                      | Automático                       |

### Uso en el pipeline

```bash
# @blendverse-back ejecuta internamente:
pnpm --filter @opencode-automation/scripts generate-back \
  --entity Product --table productos \
  --fields "nombre:string,precio:number" \
  --operations getAll,get,create,update,delete  # o subset segun requerimientos

# @blendverse-front ejecuta internamente:
pnpm --filter @opencode-automation/scripts generate-front \
  --entity Product --server-domain Products \
  --operations getAll,get,create,update,delete  # o subset segun requerimientos

# Humano ejecuta manualmente:
pnpm --filter @opencode-automation/scripts audit-arch
```

**Nota:** Los scripts actualizan los registros globales de forma idempotente y rechazan sobrescribir dominios existentes salvo con `--force` explícito.

**Importante:** El agente no debe inferir operaciones por separado. Debe leer el contrato compartido `specs/{feature}/contracts/operations.json` y pasar `--operations-file` a ambos generators.

Los generators crean scaffold técnico y CRUD genérico. La lógica de negocio de la feature sigue siendo responsabilidad de los agentes coder.

---

## Scripts Pendientes (Fase 2 — Migrations)

| Script                         | Descripción                                                         | Quién lo ejecuta                        | Cuándo                                                   | Modo                               |
| ------------------------------ | ------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------- | ---------------------------------- |
| `migrate-usecases`             | Mueve `UseCases/` de `Domain/` a `Application/` y actualiza imports | **@blendverse-arch-fixer** o **Humano** | Cuando se detecta desvío de estructura                   | Manual (corrección arquitectónica) |
| `migrate-domain-consolidation` | Extrae lógica DI de `index.ts` a `[domain].di.ts`                   | **@blendverse-arch-fixer** o **Humano** | Cuando `index.ts` tiene lógica (desvío B3)               | Manual (corrección arquitectónica) |
| `migrate-interfaces-to-app`    | Migra DTOs de `Domain/` a `Application/[domain].types.ts`           | **@blendverse-arch-fixer** o **Humano** | Cuando se detectan tipos legacy en `Domain/` (desvío B1) | Manual (corrección arquitectónica) |

### Flujo de corrección arquitectónica

```bash
# 1. Humano ejecuta auditoría
pnpm --filter @opencode-automation/scripts audit-arch

# 2. Humano invoca @blendverse-arch-fixer con el reporte
# 3. @blendverse-arch-fixer aplica las skills de migración según los desvíos detectados
#    (los scripts de migración todavía no están implementados)
```

---

## Scripts Pendientes (Fase 3 — Validators)

| Script                 | Descripción                                                | Quién lo ejecuta         | Cuándo                                      | Modo                                                     |
| ---------------------- | ---------------------------------------------------------- | ------------------------ | ------------------------------------------- | -------------------------------------------------------- |
| `validate-qa`          | Ejecuta tsc + eslint + vitest + verificación de estructura | **@blendverse-qa**       | Después de cada implementación (back/front) | Automático (dentro del pipeline)                         |
| `validate-code-review` | Checklist automatizado de 16 ítems (parcial)               | **@blendverse-reviewer** | Después de QA PASS                          | Semi-automático (algunos checks requieren juicio humano) |

### Integración en el pipeline

```bash
# @blendverse-qa ejecuta internamente:
pnpm --filter @opencode-automation/scripts validate-qa \
  --scope server \
  --affected-files "packages/server/src/domains/Products/**/*"

# @blendverse-reviewer ejecuta internamente:
pnpm --filter @opencode-automation/scripts validate-code-review \
  --task-id "TASK-004-employee-daily-reminders-20260814-1"
```

**Nota:** `validate-code-review` automatiza los checks 1, 2, 4, 8, 9, 10 (grep-based). Los checks 3, 5, 6, 7, 11-17 requieren juicio del agente y no se scriptean.

---

## Resumen de Ejecutores

### Humanos (comandos directos)

| Script               | Cuándo usarlo                                                                    |
| -------------------- | -------------------------------------------------------------------------------- |
| `audit-arch`         | Antes de correcciones arquitectónicas, para ver el estado actual                 |
| `migrate-*` (Fase 2) | Cuando se quiere corregir desvíos manualmente sin invocar @blendverse-arch-fixer |

### Agentes (ejecución automática dentro del pipeline)

| Agente                     | Scripts que ejecuta                                                             | Fase del pipeline                       |
| -------------------------- | ------------------------------------------------------------------------------- | --------------------------------------- |
| **@blendverse-back**       | `generate-back`                                                                 | Implementación backend                  |
| **@blendverse-front**      | `generate-front`                                                                | Implementación frontend                 |
| **@blendverse-arch-fixer** | `migrate-usecases`, `migrate-domain-consolidation`, `migrate-interfaces-to-app` | Corrección arquitectónica               |
| **@blendverse-qa**         | `validate-qa`                                                                   | Validación estática post-implementación |
| **@blendverse-reviewer**   | `validate-code-review` (parcial)                                                | Revisión de estándares post-QA          |
| **@blendverse-implement**  | `validate-pipeline-state`                                                       | Registro y reanudación de tareas        |
| **@blendverse-implement**  | `capture-pipeline-baseline`                                                     | Baseline previo a Coder                 |

---

## Flujo Completo del Pipeline

```
1. Humano describe feature
   ↓
2. @blendverse-analyst → 01_requirements.md
   ↓
3. @blendverse-implement → detecta alcance (back/front/full-stack)
   ↓
4. @blendverse-back → ejecuta generate-back (si es dominio nuevo)
   @blendverse-front → ejecuta generate-front (si es dominio nuevo)
   ↓
5. @blendverse-tester → genera tests
   ↓
6. @blendverse-qa → ejecuta validate-qa
   ↓
7. @blendverse-reviewer → ejecuta validate-code-review (parcial)
   ↓
8. @blendverse-implement → cierra tarea, genera PR
```

### Corrección Arquitectónica (flujo alternativo)

```
1. Humano ejecuta audit-arch
   ↓
2. Humano invoca @blendverse-arch-fixer con el reporte
   ↓
3. @blendverse-arch-fixer ejecuta migrate-* según desvíos detectados
   ↓
4. Humano verifica con audit-arch nuevamente
```

---

## Estado de Implementación

| Fase | Scripts                                                                         | Estado          | Fecha estimada |
| ---- | ------------------------------------------------------------------------------- | --------------- | -------------- |
| 1    | `generate-back`, `generate-front`, `audit-arch`                                 | ✅ Implementado | 2026-08-14     |
| 2    | `migrate-usecases`, `migrate-domain-consolidation`, `migrate-interfaces-to-app` | 🔲 Pendiente    | Fase 2         |
| 3    | `validate-qa`, `validate-code-review`                                           | 🔲 Pendiente    | Fase 3         |

---

## Comandos Rápidos

```bash
# Listar todos los scripts disponibles
pnpm --filter @opencode-automation/scripts --silent

# Generar dominio backend (ejecutado por @blendverse-back)
pnpm --filter @opencode-automation/scripts generate-back \
  --entity Product --table productos \
  --fields "nombre:string,precio:number" \
  --operations-file specs/<feature>/contracts/operations.json

# Generar dominio frontend (ejecutado por @blendverse-front)
pnpm --filter @opencode-automation/scripts generate-front \
  --entity Product --server-domain Products \
  --operations-file specs/<feature>/contracts/operations.json

# Auditoría de arquitectura (ejecutado por humano)
pnpm --filter @opencode-automation/scripts audit-arch
pnpm --filter @opencode-automation/scripts audit-arch --json
```
