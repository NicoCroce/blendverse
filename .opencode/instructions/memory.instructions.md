---
description: Reglas del sistema de memoria multi-agente. Todo agente que escriba en memory/ debe leer este archivo primero.
applyTo: 'memory/**'
---

# Sistema de Memoria Multi-Agente (`memory/`)

## Estructura de Carpetas

Cada tarea recibe su propia subcarpeta con el formato `TASK-{rama}-YYYYMMDD-N`:

```
memory/
  TASK-feat-segments-20260517-1/
    00_baseline.json       ← baseline de calidad antes de implementar
    01_requirements.md    ← @analyst (SOLO si el origen es input crudo; ver nota abajo)
    02_dev_log.md         ← @back o @front
    03_qa_report.md       ← @qa
    04_review_log.md      ← @reviewer
    05_test_log.md         ← @tester
    BLOCKED.md             ← bloqueo de esta tarea, solo tras break-loop
  history_log.json         ← índice global cronológico (actualizado por @blendverse-implement)
```

> **`01_requirements.md` es opcional.** Solo se genera cuando el origen de la tarea es input crudo (vía `@blendverse-analyst`). Cuando el origen es Speckit, los agentes leen `specs/{feature}/spec.md` y `tasks.md` **directamente** — no se transcribe ni se copia su contenido a `memory/`. En ambos casos, `02_dev_log.md` en adelante siempre vive en `memory/{task_id}/`, porque esos archivos no tienen equivalente en Speckit.

## Convención de IDs de Tarea

- Formato: `TASK-{rama-sanitizada}-YYYYMMDD-N` donde:
  - `{rama-sanitizada}` es el nombre de la rama git activa (`git branch --show-current`) con cada `/` reemplazado por `-` (ej. `feat/segments` → `feat-segments`).
  - `N` es un número secuencial (1, 2, 3…) para esa rama.
- Ejemplo: rama `feat/segments` → `TASK-feat-segments-20260517-1`
- Para obtener el próximo ID: leer `memory/history_log.json`; si no existe ninguna entrada `IN_PROGRESS` para la rama sanitizada actual, el primero del día es `TASK-{rama-sanitizada}-YYYYMMDD-1`.
- Si una tarea `BLOCKED` se reabre después de una intervención humana, conservar la tarea original como histórico y crear un nuevo ID con `parent_task_id` y `reopened_from`.
- Si el usuario proporciona explícitamente un `task_id`, ese ID tiene prioridad y no debe ser reemplazado por uno autogenerado.

## Frontmatter Obligatorio

Todos los archivos de memoria **deben** comenzar con un bloque YAML frontmatter. Un archivo sin frontmatter es inválido y no puede ser procesado por el orquestador (`@blendverse-implement`).

### Schema — `00_baseline.json`

```json
{
  "task_id": "TASK-{rama}-YYYYMMDD-N",
  "branch": "feat/example",
  "captured_at": "YYYY-MM-DDTHH:MM:SSZ",
  "packages": {
    "server": {
      "command": "cd packages/server && npx vitest run",
      "status": "PASS | FAIL | TIMEOUT | NOT_RUN",
      "failed_tests": []
    },
    "app": {
      "command": "cd packages/app && npx vitest run",
      "status": "PASS | FAIL | TIMEOUT | NOT_RUN",
      "failed_tests": []
    }
  }
}
```

### Schema — `01_requirements.md` (solo flujo de input crudo)

```yaml
---
task_id: 'TASK-{rama}-YYYYMMDD-N'
agent: 'Analyst_Agent'
status: 'DONE' # DONE | IN_PROGRESS
version: '1.0.0'
date: 'YYYY-MM-DD'
---
```

### Schema — `02_dev_log.md`

```yaml
---
task_id: 'TASK-{rama}-YYYYMMDD-N'
agent: 'Back_Agent' # Back_Agent | Front_Agent
status: 'IMPLEMENTED' # IMPLEMENTED | IN_PROGRESS
attempts: 1 # número de iteraciones del Coder (máx. 3)
date: 'YYYY-MM-DD'
affected_files:
  - 'packages/server/src/domains/X/Domain/X.entity.ts'
---
```

> **Regla `affected_files`:** Listar **solo** los archivos que contienen lógica nueva o modificada (entidades, use cases, servicios, controladores, modelos, implementaciones de repositorio). **No listar** barrels (`index.ts`), archivos de DI (`*.di.ts`) ni archivos de rutas que solo registran el dominio sin lógica propia.

### Schema — `03_qa_report.md`

```yaml
---
task_id: 'TASK-{rama}-YYYYMMDD-N'
agent: 'QA_Agent'
status: 'PASS' # PASS | FAIL
attempts: 1 # número de ejecuciones de QA (máx. 3)
date: 'YYYY-MM-DD'
---
```

### Schema — `04_review_log.md`

```yaml
---
task_id: 'TASK-{rama}-YYYYMMDD-N'
agent: 'Reviewer_Agent'
status: 'APPROVED' # APPROVED | REJECTED
attempts: 1
date: 'YYYY-MM-DD'
---
```

### Schema — `05_test_log.md`

```yaml
---
task_id: 'TASK-{rama}-YYYYMMDD-N'
agent: 'Tester_Agent'
status: 'PASS' # PASS | FAIL
attempts: 1 # número de iteraciones del Tester (máx. 3)
date: 'YYYY-MM-DD'
---
```

### Schema — `BLOCKED.md`

```yaml
---
task_id: 'TASK-{rama}-YYYYMMDD-N'
agent: 'Back_Agent' # Back_Agent | Front_Agent | Tester_Agent | QA_Agent | Reviewer_Agent
blocked_at: 'YYYY-MM-DD HH:MM'
attempts: 3
failure_class: 'implementation_regression' # implementation_regression | stale_test | baseline | test_infrastructure | timeout | contract_ambiguity
reason: 'Descripción exacta del error repetido sin solución'
reopened_from: null
---
```

## Mecanismo Break-Loop (Anti-Bucles)

El campo `attempts` lleva el conteo independiente de iteraciones sustantivas del agente indicado en el propio reporte. `02_dev_log.md`, `03_qa_report.md`, `04_review_log.md` y `05_test_log.md` no comparten el contador.

**Regla estricta:** Si `attempts` llega a **3** sin resolución:

1. El agente activo **NO** hace handoff al Coder de nuevo.
2. Crea `memory/{task_id}/BLOCKED.md` con el schema anterior.
3. Escribe en el chat: `⛔ Se alcanzó el límite de 3 iteraciones en [agente]. Intervención humana requerida. Ver memory/{task_id}/BLOCKED.md.`
4. Detiene toda ejecución automática hasta intervención manual.

Un timeout, error de infraestructura o fallo clasificado como `baseline` no consume un intento funcional. Debe registrarse como `TIMEOUT` o `INFRA_FAILURE` y reintentarse con la política del agente.

## Registro Global `history_log.json`

`@blendverse-implement` actualiza este archivo: crea la entrada con `status: IN_PROGRESS` al resolver un `task_id` nuevo, registra cada transición de agente y la cierra con `status: COMPLETED` cuando `@blendverse-reviewer` aprueba (o `BLOCKED` si se activa el break-loop).

> **Regla de rotación:** Mantener un máximo de **10 entradas** en `tasks`. Cuando se agregue la entrada número 11, eliminar la entrada más antigua con `status: COMPLETED`. Las entradas con `status: IN_PROGRESS` o `BLOCKED` nunca se eliminan.

```json
{
  "tasks": [
    {
      "task_id": "TASK-20260517-1",
      "title": "Breve descripción de la tarea",
      "status": "COMPLETED",
      "created_at": "2026-05-17T10:00:00Z",
      "closed_at": "2026-05-17T11:30:00Z",
      "agents_chain": [
        {
          "agent": "Analyst_Agent",
          "status": "DONE",
          "timestamp": "2026-05-17T10:00:00Z"
        },
        {
          "agent": "Back_Agent",
          "status": "IMPLEMENTED",
          "timestamp": "2026-05-17T10:30:00Z"
        },
        {
          "agent": "Tester_Agent",
          "status": "PASS",
          "timestamp": "2026-05-17T10:50:00Z"
        },
        {
          "agent": "QA_Agent",
          "status": "PASS",
          "timestamp": "2026-05-17T11:00:00Z"
        },
        {
          "agent": "Reviewer_Agent",
          "status": "APPROVED",
          "timestamp": "2026-05-17T11:25:00Z"
        }
      ]
    }
  ]
}
```

## Reglas para los Agentes

1. **Antes de escribir**, leer `memory/history_log.json` para obtener el `task_id` activo, salvo que el orquestador lo haya proporcionado explícitamente.
2. **No sobreescribir** archivos de una tarea anterior sin generar un nuevo `task_id` o declarar explícitamente una re-iteración de la misma tarea.
3. **El frontmatter es inmutable** una vez que el archivo alcanza estado final (`DONE`, `IMPLEMENTED`, `PASS`, `APPROVED`). Para re-iterar, incrementar `attempts`.
4. **Cada agente escribe únicamente su archivo designado**; no modifica archivos de otros agentes.
5. **Rutas relativas** — siempre usar la ruta desde la raíz del monorepo (ej. `packages/server/src/...`).
6. **Brevedad obligatoria en reportes** — los cuerpos de `03_qa_report.md` y `04_review_log.md` deben contener solo lo necesario para que el siguiente agente actúe: si el resultado es `PASS`/`APPROVED`, omitir el output de terminal (solo registrar el estado); si es `FAIL`/`REJECTED`, incluir únicamente el error concreto, la clasificación y el archivo afectado.
7. **Baseline y clasificación** — Tester y QA deben distinguir regresiones nuevas de fallos capturados en `00_baseline.json`; un test obsoleto solo puede actualizarse si el contrato aprobado cambió y el reporte lo demuestra.

## Espejo en Engram (`engram-sync`)

Cada artefacto de memoria se espeja en Engram (skill `engram-sync`) para recuperación entre sesiones:

- **Quién:** cada agente espeja su propio artefacto en su paso de cierre; `@blendverse-implement` espeja `registration` (Paso 1) y `status` (Paso 4).
- **Topic keys:** `task/{task_id}/registration`, `task/{task_id}/dev-log`, `task/{task_id}/test-log`, `task/{task_id}/qa-report`, `task/{task_id}/review-log`, `task/{task_id}/status`.
- **Regla de oro:** los archivos de `memory/` siguen siendo la **fuente de verdad**. Engram es un espejo de estado; si se contradicen, gana el archivo y se corrige el espejo.
- **`capture_prompt: false`** en todos los espejos (son artefactos automatizados, no decisiones humanas).
