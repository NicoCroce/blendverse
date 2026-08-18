---
description: Alias de compatibilidad para mejorar una feature usando el pipeline Blendverse unificado.
---

# Alias de compatibilidad

Este comando no mantiene un pipeline paralelo. Para evitar diferencias de estado,
ejecuta el mismo protocolo que `blendverse-start-feature` con la feature indicada.

Feature a mejorar: `{{feature}}`

1. Leer `specs/{{feature}}/spec.md`, `plan.md` y `tasks.md`.
2. Si falta algún artefacto, detenerse e indicar qué fase de Speckit debe completarse.
3. Si los artefactos existen, invocar `@blendverse-implement` con `feature={{feature}}`.
4. `@blendverse-implement` debe resolver o usar el `task_id` explícito, validar el estado en disco, reconciliar Engram y ejecutar la cadena `back → front → tester → qa → reviewer` según el alcance.

No generar `01_requirements.md` para una feature proveniente de Speckit y no crear
un segundo `history_log` ni una segunda convención de checkpoints.
