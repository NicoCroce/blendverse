---
description: Reglas del sistema de memoria multi-agente. Todo agente que escriba en memory/ debe leer este archivo primero.
applyTo: 'memory/**'
---

# Sistema de Memoria Multi-Agente (`memory/`)

## Estructura de Carpetas

Cada tarea recibe su propia subcarpeta con el formato `TASK-YYYYMMDD-N`:

```
memory/
  TASK-20260517-1/
    01_requirements.md    ← @analyst
    02_dev_log.md         ← @back o @front
    03_qa_report.md       ← @qa
    04_review_log.md      ← @reviewer
  history_log.json        ← índice global cronológico (actualizado por el Director)
  BLOCKED.md              ← se crea SOLO si se alcanza el break-loop (attempts >= 3)
```

## Convención de IDs de Tarea

- Formato: `TASK-YYYYMMDD-N` donde `N` es un número secuencial (1, 2, 3…)
- Ejemplo: `TASK-20260517-1`
- Para obtener el próximo ID: leer `memory/history_log.json`; si no existe, el primero es `TASK-YYYYMMDD-1`

## Frontmatter Obligatorio

Todos los archivos de memoria **deben** comenzar con un bloque YAML frontmatter. Un archivo sin frontmatter es inválido y no puede ser procesado por el Director.

### Schema — `01_requirements.md`

```yaml
---
task_id: 'TASK-YYYYMMDD-N'
agent: 'Analyst_Agent'
status: 'DONE' # DONE | IN_PROGRESS
version: '1.0.0'
date: 'YYYY-MM-DD'
---
```

### Schema — `02_dev_log.md`

```yaml
---
task_id: 'TASK-YYYYMMDD-N'
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
task_id: 'TASK-YYYYMMDD-N'
agent: 'QA_Agent'
status: 'PASS' # PASS | FAIL
attempts: 1 # número de ejecuciones de QA (máx. 3)
date: 'YYYY-MM-DD'
---
```

### Schema — `04_review_log.md`

```yaml
---
task_id: 'TASK-YYYYMMDD-N'
agent: 'Reviewer_Agent'
status: 'APPROVED' # APPROVED | REJECTED
attempts: 1
date: 'YYYY-MM-DD'
---
```

### Schema — `05_test_log.md`

```yaml
---
task_id: 'TASK-YYYYMMDD-N'
agent: 'Tester_Agent'
status: 'PASS' # PASS | FAIL
attempts: 1 # número de iteraciones del Tester (máx. 3)
date: 'YYYY-MM-DD'
---
```

### Schema — `BLOCKED.md`

```yaml
---
task_id: 'TASK-YYYYMMDD-N'
agent: 'QA_Agent' # o "Reviewer_Agent" o "Tester_Agent"
blocked_at: 'YYYY-MM-DD HH:MM'
attempts: 3
reason: 'Descripción exacta del error repetido sin solución'
---
```

## Mecanismo Break-Loop (Anti-Bucles)

El campo `attempts` en el frontmatter lleva el conteo de iteraciones por agente.

**Regla estricta:** Si `attempts` llega a **3** sin resolución:

1. El agente activo **NO** hace handoff al Coder de nuevo.
2. Crea `memory/BLOCKED.md` con el schema anterior.
3. Escribe en el chat: `⛔ Se alcanzó el límite de 3 iteraciones en [agente]. Intervención humana requerida. Ver memory/BLOCKED.md.`
4. Detiene toda ejecución automática hasta intervención manual.

## Registro Global `history_log.json`

El Director (Chat base) actualiza este archivo al abrir y cerrar cada tarea.

> **Regla de rotación:** Mantener un máximo de **10 entradas** en el array. Cuando se agregue la entrada número 11, eliminar la entrada más antigua con `status: COMPLETED`. Las entradas con `status: IN_PROGRESS` o `BLOCKED` nunca se eliminan.

```json
[
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
```

## Reglas para los Agentes

1. **Antes de escribir**, leer `memory/history_log.json` para obtener el `task_id` activo.
2. **No sobreescribir** archivos de una tarea anterior sin generar un nuevo `task_id`.
3. **El frontmatter es inmutable** una vez que el archivo alcanza estado final (`DONE`, `IMPLEMENTED`, `PASS`, `APPROVED`). Para re-iterar, incrementar `attempts`.
4. **Cada agente escribe únicamente su archivo designado**; no modifica archivos de otros agentes.
5. **Rutas relativas** — siempre usar la ruta desde la raíz del monorepo (ej. `packages/server/src/...`).
6. **Brevedad obligatoria en reportes** — los cuerpos de `03_qa_report.md` y `04_review_log.md` deben contener solo lo necesario para que el siguiente agente actúe: si el resultado es `PASS`/`APPROVED`, omitir el output de terminal (solo registrar el estado); si es `FAIL`/`REJECTED`, incluir únicamente el error concreto y el archivo afectado.
