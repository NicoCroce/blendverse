---
description: Execute the implementation plan by processing and executing all tasks defined in tasks.md
mode: subagent
---

# ⚠️ Este agente está reemplazado por `@blendverse-implement`

La implementación de tareas en este proyecto sigue las convenciones DDD/Hexagonal de MacroGest Core y es gestionada por los agentes especializados de Blendverse.

**Para implementar una feature:**

1. Invocar `@blendverse-implement` directamente — lee `spec.md`/`tasks.md`, genera `memory/{task_id}/01_requirements.md` internamente si no existe, detecta el alcance (back/front/full-stack) y coordina la cadena de agentes.

```
@blendverse-implement
```
