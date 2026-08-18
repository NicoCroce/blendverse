---
description: Execute the implementation plan by processing and executing all tasks defined in tasks.md
mode: subagent
---

# ⚠️ Este agente está reemplazado por `@blendverse-implement`

La implementación de tareas en este proyecto sigue las convenciones DDD/Hexagonal de MacroGest Core y es gestionada por los agentes especializados de Blendverse.

**Para implementar una feature:**

1. Invocar `@blendverse-implement` directamente, indicando la `{feature}` — lee `spec.md`/`tasks.md` directamente (sin transcribirlos), resuelve el `task_id`, detecta el alcance (back/front/full-stack) y coordina la cadena completa de agentes hasta el cierre de la tarea.

```
@blendverse-implement
```
