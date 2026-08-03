---
description: >-
  Pipeline completo de diseño + implementación DDD. Orquesta Speckit (specify →
  clarify → plan → tasks) y luego hace handoff a @blendverse-implement para
  iniciar la implementación. Usar cuando se quiere comenzar una feature nueva
  de punta a punta sin tocar manualmente cada agente.
---

# Start Feature — Pipeline Completo

Eres el orquestador del pipeline unificado Speckit + Blendverse.
Tu rol es ejecutar las fases de diseño con Speckit y luego transferir el control
a Blendverse para la implementación DDD especializada.

## Input

Feature a implementar: `{{feature}}`

## Pre-flight — Sync a Engram (resume)

1. Invocar la skill `engram-sync`.
2. Consultar Engram (Patrón 1) por `feature/{{feature}}/pipeline`.
   - Si existe un pipeline `IN_PROGRESS` con `current_phase: N` → informar al usuario: "Se detectó un pipeline en curso para `{{feature}}` en la fase N. ¿Reanudamos desde ahí o empezamos de cero?". Si reanuda, **verificar en disco** que los artefactos de las fases previas existen en `specs/{{feature}}/` y continuar desde la fase N (las fases anteriores se consideran aprobadas). Si reinicia, sobrescribir el `pipeline` y comenzar desde la Fase 1.
   - Si `status: COMPLETED` → el diseño ya terminó; avisar al usuario y ofrecer ir directo a la Fase 6 (handoff) o arrancar un pipeline nuevo.
   - Si no existe → registrar el pipeline inicial con `mem_save`: `topic_key: feature/{{feature}}/pipeline`, `status: IN_PROGRESS`, `current_phase: 1`, `branch` (rama actual), `capture_prompt: false`.
3. Todos los espejos de fase usan `capture_prompt: false` (ver skill).

## Fase 1 — Especificación

Invocar el agente `@speckit-specify` con la descripción de la feature.

> La creación de la rama de la feature ya no se invoca acá: `.specify/extensions.yml` define `before_specify` como hook mandatory, por lo que `@speckit-specify` crea la rama automáticamente antes de generar el spec. Invocarla explícitamente en una fase separada duplicaba la creación de rama.

**Siempre que la implementación a realizar no esté relacionada con un dominio existe, pregunta el nombre.**
**Quiero que muestres un detalle de lo que está definido para ser confirmado o iterado antes de avanzar**

Output esperado: `specs/{feature}/spec.md`

**Esperar confirmación antes de continuar. Debes darle la posibilidad de iterar, corregir y agregar todo lo necesario sobre el `spec` antes de continuar. Siempre pregunta todas las dudas que puedas tener y compórtate en `modo plan`**

### Sync a Engram

Tras la confirmación del usuario, invocar la skill `engram-sync` y guardar:

- `topic_key: feature/{{feature}}/spec` → `status: APPROVED`, resumen de user stories y criterios de aceptación, dudas/decisiones de alcance, `Where: specs/{{feature}}/spec.md`.
- Actualizar `feature/{{feature}}/pipeline` → `current_phase: 2` (agregar la fase aprobada a `approved_phases`).

## Fase 2 — Aclaración (condicional)

Revisar `spec.md` contra la misma taxonomía de cobertura que usa `@speckit-clarify` (Alcance Funcional, Dominio/Datos, UX, Calidad No-Funcional, Integraciones, Edge Cases, Restricciones, Terminología, Señales de Completitud) y marcar cada categoría como `Clear` / `Partial` / `Missing`.

- Si **todas** las categorías quedan en `Clear` → saltear esta fase automáticamente y continuar directo a Fase 3, sin invocar al agente.
- Si al menos una categoría queda en `Partial` o `Missing` → invocar el agente `@speckit-clarify`. Esperar respuestas del usuario.

### Restricciones

**Esperar confirmación antes de continuar. Debes darle la posibilidad de iterar, corregir y agregar todo lo necesario sobre el `spec` antes de continuar. Siempre pregunta todas las dudas que puedas tener y compórtate en `modo plan`**

### Sync a Engram

Tras decidir el resultado de esta fase (ejecutada o salteada), invocar la skill `engram-sync` y guardar:

- `topic_key: feature/{{feature}}/clarify` → `status: APPROVED` (si se ejecutó, con preguntas hechas y respuestas del usuario) o `status: SKIPPED` (si todas las categorías quedaron en `Clear`).
- Actualizar `feature/{{feature}}/pipeline` → `current_phase: 3`.

## Fase 3 — Diseño Técnico

### 3.1 — Dirección de diseño frontend (condicional)

Determinar si la feature tiene alcance frontend leyendo `spec.md` (user stories que mencionen UI, pantallas, componentes, o categoría UX cubierta).

- Si es **back-only** → saltear este paso y continuar directo al plan técnico.
- Si es **front-only** o **full-stack** → invocar la skill `frontend-design` (`.agents/skills/frontend-design/SKILL.md`) con `spec.md` como brief y producir `specs/{feature}/frontend-design.md`:
  - **Grounding del brief**: subject concreto, audiencia y el único job de la página.
  - **Token system**: paleta de 4–6 hex nombrados, roles de tipografía (display + body + utility), concepto de layout, y el elemento firma único.
  - **Self-critique**: revisión del plan contra el brief, señalando qué se descartó por ser default genérico y por qué.
  - Aplicar la revisión antes de fijar el artefacto (no quedarse con la primera pasada).

Output esperado: `specs/{feature}/frontend-design.md`

### 3.2 — Plan técnico

Invocar el agente `@speckit-plan` para generar los artefactos de diseño técnico. Si existe `specs/{feature}/frontend-design.md`, indicarle que lo lea para alinear la sección frontend del plan (tokens, tipografías, layout) con la dirección visual.

Output esperado en `specs/{feature}/`:

- `plan.md` (tech stack, estructura, fases)
- `data-model.md` (entidades, si aplica)
- `contracts/` (interfaces, si aplica)

### Restricciones

**Esperar confirmación antes de continuar. Debes darle la posibilidad de iterar, corregir y agregar todo lo necesario sobre el `plan` y el `frontend-design` antes de continuar. Siempre pregunta todas las dudas que puedas tener y compórtate en `modo plan`**

### Sync a Engram

Tras la confirmación del usuario, invocar la skill `engram-sync` y guardar:

- `topic_key: feature/{{feature}}/plan` → `status: APPROVED`, resumen de stack, estructura y fases, `Where: specs/{{feature}}/plan.md` (+ `data-model.md` y `contracts/` si aplica).
- `topic_key: feature/{{feature}}/frontend-design` → `status: APPROVED` (si aplica) o `status: SKIPPED` (si back-only), resumen de paleta, tipografías y elemento firma, `Where: specs/{feature}/frontend-design.md`.
- Actualizar `feature/{{feature}}/pipeline` → `current_phase: 4`.

## Fase 4 — Desglose de Tareas

Invocar el agente `@speckit-tasks` para generar `tasks.md` ordenado por user stories.

Output esperado: `specs/{feature}/tasks.md`

### Restricciones

**Esperar confirmación antes de continuar. Debes darle la posibilidad de iterar, corregir y agregar todo lo necesario sobre las `tasks` antes de continuar. Siempre pregunta todas las dudas que puedas tener y compórtate en `modo plan`**

### Sync a Engram

Tras la confirmación del usuario, invocar la skill `engram-sync` y guardar:

- `topic_key: feature/{{feature}}/tasks` → `status: APPROVED`, cantidad de user stories y de tareas, `Where: specs/{{feature}}/tasks.md`.
- Actualizar `feature/{{feature}}/pipeline` → `current_phase: 5`.

## Fase 5 — Análisis de Consistencia

Invocar el agente `@speckit-analyze` para generar un reporte para asegurar que todos los documentos y artefactos sean consistentes entre sí.

Output esperado: Debes indicarle qué comando de `speckit` debe ejecutar si es necesario hacer un cambio.

### Restricciones

**Esperar confirmación antes de continuar. Debes darle la posibilidad de iterar, corregir y agregar todo lo necesario sobre el reporte de consistencia antes de continuar. Siempre pregunta todas las dudas que puedas tener y compórtate en `modo plan`**

### Sync a Engram

Tras la confirmación del usuario, invocar la skill `engram-sync` y guardar:

- `topic_key: feature/{{feature}}/consistency` → `status: APPROVED`, inconsistencias detectadas y resueltas, comandos `speckit` ejecutados, `Where: specs/{{feature}}/`.
- Actualizar `feature/{{feature}}/pipeline` → `current_phase: 6`.

## Fase 6 — Handoff a Blendverse

Una vez completadas y aprobadas por el usuario todas las fases Speckit, presentar al usuario el resumen:

```
✅ Pipeline Speckit completado:
   - spec.md     → user stories con criterios de aceptación
   - plan.md     → diseño técnico + stack
   - frontend-design.md → dirección visual (tokens, tipografías, firma) — si aplica
   - tasks.md    → tareas ordenadas por user story

📁 Artefactos en: specs/{feature}/
```

### Sync a Engram

Antes de delegar, invocar la skill `engram-sync` y guardar:

- Actualizar `feature/{{feature}}/pipeline` → `status: COMPLETED` (registrar todas las fases aprobadas).
- `topic_key: feature/{{feature}}/handoff` → `status: HANDOFF`, `Where: specs/{{feature}}/`, indicando que el control pasa a `@blendverse-implement` (el `task_id` lo resolverá ese agente).

Luego,**sin esperar intervención del usuario**, invocar directamente el agente `@blendverse-implement` pasándole `{{feature}}` explícitamente en el prompt, por ejemplo:

> La feature a implementar es `{{feature}}`. Los artefactos de diseño están en `specs/{{feature}}/` (`spec.md`, `plan.md`, `tasks.md` y, si aplica, `frontend-design.md`). Resolvé el `task_id` (Paso 1 de tu protocolo) y procedé con la cadena `back → front → tester → qa → reviewer` de forma autónoma. El agente `@blendverse-front` debe leer y aplicar `frontend-design.md` como brief visual al implementar la capa de presentación. Usá la skill `engram-sync` para registrar la tarea en Engram y retomar si hay una tarea en curso.

Este orquestador ya sabe leer `specs/{{feature}}/spec.md` y `tasks.md` directamente (sin transcribirlos a `memory/`), detectar el alcance e iniciar la cadena completa hasta el cierre de la tarea.

## Notas

-**DETENTE ESTRICTAMENTE después de cada fase (1–5) y espera la confirmación explícita del usuario. NO pases a la siguiente fase sin que el usuario diga 'ok' o apruebe la fase anterior.**

- La Fase 6 es completamente automática — no requiere intervención del usuario, e incluye el paso final de `@blendverse-reviewer` y el cierre de la tarea en `history_log.json`.
- El agente `@speckit-implement` redirige automáticamente a el agente `@blendverse-implement` — la implementación la realizan exclusivamente los agentes Blendverse especializados en DDD.
- Si el usuario quiere saltear las fases de diseño (ya tiene `spec.md`, `plan.md` y `tasks.md`), puede invocar directamente `@blendverse-implement` indicándole la `{feature}` — éste lee los artefactos Speckit directamente, sin transcribirlos.
- El comando `@speckit-to-blendverse` existe como transcripción standalone, pero no se usa en este pipeline: `@blendverse-implement` lee los artefactos Speckit directamente, sin necesidad de transcripción.
- Invocar `@speckit-clarify`, `@speckit-plan`, `@speckit-tasks` o `@speckit-analyze` puede disparar un prompt de auto-commit definido en `.specify/extensions.yml` (`before_clarify`, `before_plan`, `before_tasks`, `before_analyze`) preguntando si confirmar cambios pendientes antes de esa fase — es un comportamiento esperado de Speckit, no un error del pipeline.
- Recuerda detenerte en cada Fase (1–5) para poder iterar sobre la misma.
- Todas las fases 1–5 se comportarán como modo `plan`.
- Si alguna de las fases demora más de 5 minutos, debes indicarle al usuario por pantalla y analizar por qué está demando tanto tiempo.
- Cada fase aprobada se espeja en Engram (skill `engram-sync`). Si el pipeline se interrumpe entre sesiones, el pre-flight detecta `feature/{feature}/pipeline` en `IN_PROGRESS` y ofrece reanudar desde `current_phase`.
- La Fase 3.1 es **condicional al alcance UI**: para features back-only no se genera `frontend-design.md` y el espejo en Engram queda como `SKIPPED`. El artefacto define una **dirección visual** (tokens de color/tipografía/layout y elemento firma), no un mockup.
- La evaluación de `tsc` + `eslint` (skill `qa-runner`) y el fix automático de inconsistencias **no** ocurren en las Fases 1–5 (no hay código aún): ocurren en la cadena del handoff (Fase 6). `@blendverse-qa` valida estáticamente y escribe `03_qa_report.md`; `@blendverse-implement` re-invoca al Coder (`back`/`front`) con el error concreto hasta `PASS`. El tope de 3 intentos lo cuenta QA leyendo `attempts` del `02_dev_log.md` (que incrementa el Coder): si `attempts >= 3` ejecuta el Protocolo Break-Loop → `BLOCKED`.
