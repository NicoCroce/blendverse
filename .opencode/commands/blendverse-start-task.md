---
description: Inicia el flujo orquestado completo para una nueva tarea. Genera el task_id, delega a @blendverse-analyst para crear los requerimientos y orquesta la cadena Analyst → Coder → QA → Reviewer.
---

Actúa como el punto de entrada del flujo orquestado. Tu responsabilidad es iniciar la tarea y asegurarte de que cada eslabón de la cadena tenga el contexto que necesita. El cierre final de la tarea en `history_log.json` queda a cargo de `@blendverse-implement` una vez aprobada por `@blendverse-reviewer`.

## Pasos a ejecutar

### 1. Registrar la tarea en el historial

1. Leer `memory/history_log.json` (crear el archivo si no existe con `{ "tasks": [] }`).
2. Ejecutar `git branch --show-current` y sanitizar el resultado (`/` → `-`).
3. Generar el siguiente `task_id` con el formato `TASK-{rama-sanitizada}-YYYYMMDD-N` (ver `.opencode/instructions/memory.instructions.md`).
4. Agregar al array `tasks` una nueva entrada con:
   - `task_id`: el ID generado
   - `title`: resumen en una línea de la tarea del usuario
   - `status`: `"IN_PROGRESS"`
   - `created_at`: timestamp actual ISO 8601
   - `agents_chain`: `[]`

### 2. Delegar a @blendverse-analyst

Invocar el agente `@blendverse-analyst` con el siguiente contexto:

> **task_id activo:** `{task_id_generado}`
>
> **Requerimiento del usuario:**
> {{userRequest}}
>
> Cargar y seguir la skill `requirements-analyst`. Crear la carpeta `memory/{task_id}/` y escribir `01_requirements.md`.
> Al finalizar, hacer handoff a `@blendverse-implement` pasando el `task_id`, quien detecta el alcance (back/front/full-stack) y coordina la cadena completa hasta el cierre de la tarea.

### 3. Instrucciones para el resto de la cadena

Informar al usuario del flujo que se va a ejecutar:

```
📋 Tarea iniciada: {task_id}

Cadena de ejecución:
  1. @blendverse-analyst  → 01_requirements.md
  2. @blendverse-back / @blendverse-front → código + 02_dev_log.md
  3. @blendverse-tester   → 05_test_log.md
  4. @blendverse-qa       → 03_qa_report.md
  5. @blendverse-reviewer → 04_review_log.md
  6. @blendverse-implement → cierre en history_log.json (status: COMPLETED)
```

---

**Requerimiento del usuario:** {{userRequest}}
