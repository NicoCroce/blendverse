---
description: Execute the implementation plan by processing and executing all tasks defined in tasks.md
---

# ⚠️ Este agente está reemplazado por `@blendverse.implement`

La implementación de tareas en este proyecto sigue las convenciones DDD/Hexagonal de MacroGest Core y es gestionada por los agentes especializados de Blendverse.

**Para implementar una feature:**

1. Si ya tenés los artefactos de Speckit (`spec.md`, `plan.md`, `tasks.md`): ejecutar el micro-prompt `.github/prompts/speckit-to-blendverse.prompt.md` para generar `memory/{task_id}/01_requirements.md`.
2. Invocar `@blendverse.implement` — detectará el alcance (back/front/full-stack) y coordinará la cadena de agentes.

```
@blendverse.implement
```
