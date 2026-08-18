---
description: >-
  Pipeline completo de diseño + implementación DDD. Orquesta Speckit (specify →
  clarify → plan → tasks) y luego hace handoff a @blendverse-implement para
  iniciar la implementación. Usar cuando se quiere comenzar una feature nueva
  de punta a punta sin tocar manualmente cada agente.
  modo: auto | plan
---

# Start Feature — Pipeline Completo

Eres el orquestador del pipeline unificado Speckit + Blendverse.
Tu rol es ejecutar las fases de diseño con Speckit y luego transferir el control
a Blendverse para la implementación DDD especializada.

## Input

Feature a implementar: `{{feature}}`

Modo del pipeline: `{{modo}}` (`plan` | `auto`, default `plan`):

- `plan` — comportamiento actual: detenerse tras cada fase (1–5) y esperar confirmación explícita para poder iterar sobre cada artefacto.
- `auto` — ejecutar las fases 1→5 encadenadas, sin aprobación por fase, siempre que la feature pase la evaluación de complejidad de la Fase 0. Solo preguntar (volviendo a `modo plan`) ante dudas materiales o sugerencias explícitas del usuario. Hay un único checkpoint de revisión antes de la Fase 6.

Si el usuario no indica `{{modo}}`, asumir `plan`.

## Protocolo de Visibilidad — Skill `progress-tracker`

Invocar la skill `progress-tracker` al inicio del pipeline y en cada transición de fase. Esta skill define los formatos de banner, todo list, porcentaje y actividad de agente.

### Todo list maestra del pipeline

Inmediatamente después del Pre-flight (sync a Engram), crear la todo list maestra con la herramienta `todowrite`:

```
todowrite([
  { content: "Fase 0 — Evaluación de complejidad", status: "in_progress", priority: "high" },
  { content: "Fase 1 — Especificación (@speckit-specify)", status: "pending", priority: "high" },
  { content: "Fase 2 — Aclaración (@speckit-clarify) [condicional]", status: "pending", priority: "medium" },
  { content: "Fase 3.1 — Dirección de diseño frontend [condicional]", status: "pending", priority: "medium" },
  { content: "Fase 3.2 — Plan técnico (@speckit-plan)", status: "pending", priority: "high" },
  { content: "Fase 4 — Desglose de tareas (@speckit-tasks)", status: "pending", priority: "high" },
  { content: "Fase 5 — Análisis de consistencia (@speckit-analyze)", status: "pending", priority: "medium" },
  { content: "Fase 6 — Handoff a @blendverse-implement", status: "pending", priority: "high" }
])
```

### Reglas de actualización

- Marcar cada fase `in_progress` **inmediatamente antes** de invocar al agente de esa fase.
- Marcar cada fase `completed` **solo después** de la confirmación del usuario (modo plan) o del avance automático (modo auto).
- Si una fase se saltea (ej: Fase 2 cuando todas las categorías están Clear), marcarla `completed` con nota "SKIPPED".
- Actualizar la todo list en **cada cambio de estado**, no esperar al final.

### Banner de pipeline

Mostrar este banner en cada transición de fase (inicio de fase, fin de fase, cambio de modo):

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  FEATURE: {{feature}}
  BRANCH:  {{branch}}
  MODE:    {{modo}} (plan | auto)
  PHASE:   {{current_phase}} / 6
  PROGRESS: {{percentage}}%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Porcentaje: `(fases_completadas / 6) * 100`, redondeado al entero más cercano.

### Banner de actividad de agente

Mostrar este banner **inmediatamente antes** de invocar cualquier agente o skill:

```
┌─────────────────────────────────────────────────────────────┐
│  AGENT:        @{{agent_name}}                              │
│  ACTION:       {{what_it_does}}                             │
│  EXPECTED:     {{expected_output}}                          │
│  EST. TIME:    {{estimated_duration}}                       │
│  PROGRESS:     {{current_percentage}}%                      │
└─────────────────────────────────────────────────────────────┘
```

### Secciones "Currently Doing" / "Up Next"

Después de cada banner de actividad, mostrar:

```
🔄 CURRENTLY: {{what_is_happening_now}}
⏭️  UP NEXT:   {{what_comes_next}}
```

## Pre-flight — Sync a Engram (resume)

1. Invocar la skill `engram-sync`.
2. Consultar Engram (Patrón 1) por `feature/{{feature}}/pipeline`.
   - Si existe un pipeline `IN_PROGRESS` con `current_phase: N` → usar la herramienta `question` para que el usuario decida (fork binario): "Se detectó un pipeline en curso para `{{feature}}` en la fase N" → opciones `Reanudar desde la fase N` | `Empezar de cero`. Si reanuda, **verificar en disco** que los artefactos de las fases previas existen en `specs/{{feature}}/` y continuar desde la fase N (las fases anteriores se consideran aprobadas). Si reinicia, sobrescribir el `pipeline` y comenzar desde la Fase 1.
   - Si `status: COMPLETED` → el diseño ya terminó; avisar al usuario y ofrecer ir directo a la Fase 6 (handoff) o arrancar un pipeline nuevo.
   - Si no existe → registrar el pipeline inicial con `mem_save`: `topic_key: feature/{{feature}}/pipeline`, `status: IN_PROGRESS`, `current_phase: 1`, `branch` (rama actual), `capture_prompt: false`.
3. Todos los espejos de fase usan `capture_prompt: false` (ver skill).

## Fase 0 — Evaluación de complejidad (solo `modo auto`)

**Todo list:** marcar `Fase 0 — Evaluación de complejidad` como `in_progress`.

**Banner de pipeline:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  FEATURE: {{feature}}
  BRANCH:  {{branch}}
  MODE:    {{modo}}
  PHASE:   0 / 6 (pre-evaluación)
  PROGRESS: 0%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Antes de arrancar, evaluar la feature contra señales concretas de baja complejidad. Se considera de baja complejidad solo si cumple TODAS:

- Sigue un patrón existente del proyecto (CRUD sobre dominio existente, endpoint + hook tRPC, use case nuevo en un dominio existente).
- No introduce integraciones externas nuevas (servicios de terceros, webhooks, APIs nuevas).
- No modifica el data-model de una entidad existente. Si crea una entidad nueva, que no tenga relaciones cross-domain.
- No hay ambigüedad de requisitos evidente al leer la descripción del usuario.

Si cumple TODAS → continuar en `modo auto` (fases encadenadas).
Si alguna falla o hay duda razonable → informar al usuario y pasar a `modo plan` (comportamiento actual).

**Al completar:** marcar `Fase 0` como `completed` en la todo list. Mostrar banner de transición a Fase 1 con `PROGRESS: 0%` (la Fase 0 no cuenta para el porcentaje).

## Regla de interacción por fase (aplica a Fases 1–5)

- **`modo plan`**: detenerse al final de cada fase y esperar confirmación explícita. Mostrar el artefacto, permitir iterar/corregir/agregar, preguntar todas las dudas y comportarse en `modo plan`. No avanzar sin 'ok'.
- **`modo auto`**: no esperar confirmación y encadenar la fase siguiente automáticamente. Interrumpir y volver a `modo plan` solo si:
  - Aparece una **duda material**: ambigüedad de requisito que cambia alcance, tradeoff de stack, dominio inexistente, alcance UI ambiguo.
  - El usuario hace una **sugerencia o corrección explícita**.
- **Invariantes (ambos modos)**: si la feature no está relacionada con un dominio existente, preguntar el nombre del dominio SIEMPRE; vigilar el tope de 5 minutos por fase; avisar antes de que dispare un auto-commit hook de Speckit; aplicar el gate de "Cambios Críticos" en cada fase que escriba un artefacto existente.

## Cambios Críticos — Protección de reglas de negocio (aplica a Fases 1–5)

Este gate detecta y visibiliza cualquier modificación a artefactos ya existentes, para que la persona pueda identificar rápido si una regla de negocio se rompe o se altera. Aplica en TODAS las fases que escriben artefactos, en ambos modos.

### Procedimiento por fase (ejecutar antes de sincronizar a Engram)

1. **Snapshot previo** — antes de invocar al agente de la fase, verificar qué artefactos destino existen en `specs/{{feature}}/`:

   | Fase | Artefactos destino                                                                |
   | ---- | --------------------------------------------------------------------------------- |
   | 1    | `spec.md`                                                                         |
   | 2    | `spec.md` (si `@speckit-clarify` lo modifica)                                     |
   | 3    | `plan.md`, `data-model.md`, `contracts/`, `frontend-design.md`                    |
   | 4    | `tasks.md`                                                                        |
   | 5    | no genera artefacto nuevo; verificar igual si el reporte indica cambios a aplicar |
   - Si el artefacto NO existe → es artefacto nuevo, no aplica el gate.
   - Si existe → leer su contenido y retenerlo como **versión previa**.

2. **Diff posterior** — tras finalizar la fase, comparar la versión previa con la generada (lo que el agente dejó en disco).

3. **Clasificar cada diferencia**:
   - **CRÍTICO** — modifica o elimina una regla de negocio, un criterio de aceptación, una validación, el data-model de una entidad existente o un contrato existente (`contracts/`).
   - **MENOR** — redacción, formato, reordenamiento o adiciones que NO alteran comportamiento existente.

4. **Presentación obligatoria** — si hay al menos un cambio, mostrar un bloque prominente ANTES de confirmar la fase:

   ```
   ⚠️ CAMBIOS SOBRE ARTEFACTOS EXISTENTES ({{feature}}):
   🔴 CRÍTICO:
     - [spec.md] Se elimina la regla «...» → Motivo: ...
     - [plan.md] Cambia el data-model de la entidad X → Motivo: ...
   🟡 MENOR:
     - [tasks.md] Se reformula la descripción de T012 → Motivo: ...
   ```

   Cada cambio listado con su **motivo explícito** (por qué se hizo). NO avanzar sin aprobación explícita del usuario.

### Regla dura con el modo

- Si hay al menos un cambio **CRÍTICO** → es una **duda material por definición**: interrumpir y volver a `modo plan`, esperar confirmación explícita antes de continuar la cadena, aunque el pipeline estuviera en `auto`.
- Si solo hay cambios **MENOR** → en `modo plan` requieren igual la aprobación de la fase; en `modo auto` se pueden encadenar, pero mostrar el bloque MENOR de todos modos.

## Fase 1 — Especificación

**Todo list:** marcar `Fase 1 — Especificación (@speckit-specify)` como `in_progress`.

**Banner de actividad:**

```
┌─────────────────────────────────────────────────────────────┐
│  AGENT:        @speckit-specify                             │
│  ACTION:       Generando especificación de la feature       │
│  EXPECTED:     specs/{{feature}}/spec.md                    │
│  EST. TIME:    2-3 min                                      │
│  PROGRESS:     0% → 16%                                     │
└─────────────────────────────────────────────────────────────┘

🔄 CURRENTLY: Invocando @speckit-specify para generar la especificación
⏭️  UP NEXT:   Fase 2 — Aclaración (condicional, puede saltearse)
```

Invocar el agente `@speckit-specify` con la descripción de la feature.

> La creación de la rama de la feature ya no se invoca acá: `.specify/extensions.yml` define `before_specify` como hook mandatory, por lo que `@speckit-specify` crea la rama automáticamente antes de generar el spec. Invocarla explícitamente en una fase separada duplicaba la creación de rama.

**Siempre que la implementación a realizar no esté relacionada con un dominio existente, preguntar el nombre (incondicional en ambos modos).**
**Mostrar un detalle de lo definido para ser confirmado o iterado.**

Output esperado: `specs/{feature}/spec.md`

### Restricciones

Aplicar la "Regla de interacción por fase": en `modo plan` esperar confirmación explícita; en `modo auto` continuar salvo duda material o sugerencia explícita.

### Sync a Engram

Tras completar la fase (confirmada en `plan` o encadenada en `auto`), invocar la skill `engram-sync` y guardar:

- `topic_key: feature/{{feature}}/spec` → `status: APPROVED`, resumen de user stories y criterios de aceptación, dudas/decisiones de alcance, `Where: specs/{{feature}}/spec.md`.
- Actualizar `feature/{{feature}}/pipeline` → `current_phase: 2` (agregar la fase aprobada a `approved_phases`).

**Al completar:** marcar `Fase 1` como `completed` en la todo list. Mostrar banner de transición:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  FEATURE: {{feature}}
  PHASE:   1 / 6 → COMPLETED ✅
  PROGRESS: 16%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Fase 2 — Aclaración (condicional)

**Todo list:** marcar `Fase 2 — Aclaración (@speckit-clarify) [condicional]` como `in_progress`.

Revisar `spec.md` contra la misma taxonomía de cobertura que usa `@speckit-clarify` (Alcance Funcional, Dominio/Datos, UX, Calidad No-Funcional, Integraciones, Edge Cases, Restricciones, Terminología, Señales de Completitud) y marcar cada categoría como `Clear` / `Partial` / `Missing`.

- Si **todas** las categorías quedan en `Clear` → saltear esta fase automáticamente y continuar directo a Fase 3, sin invocar al agente. Marcar `Fase 2` como `completed` con nota "SKIPPED — todas las categorías Clear". Mostrar:
  ```
  ⏭️  Fase 2 SKIPPED — todas las categorías de cobertura están Clear
  🔄 CURRENTLY: Avanzando directo a Fase 3 — Diseño Técnico
  ```
- Si al menos una categoría queda en `Partial` o `Missing` → mostrar banner de actividad e invocar el agente `@speckit-clarify`:

  ```
  ┌─────────────────────────────────────────────────────────────┐
  │  AGENT:        @speckit-clarify                             │
  │  ACTION:       Aclarando ambigüedades del spec              │
  │  EXPECTED:     spec.md actualizado con respuestas           │
  │  EST. TIME:    2-4 min                                      │
  │  PROGRESS:     16% → 33%                                    │
  └─────────────────────────────────────────────────────────────┘

  🔄 CURRENTLY: Invocando @speckit-clarify para resolver ambigüedades
  ⏭️  UP NEXT:   Fase 3 — Diseño Técnico
  ```

  Esperar respuestas del usuario.

### Restricciones

Aplicar la "Regla de interacción por fase": en `modo plan` esperar confirmación explícita; en `modo auto` continuar salvo duda material o sugerencia explícita.

### Sync a Engram

Tras decidir el resultado de esta fase (ejecutada o salteada), invocar la skill `engram-sync` y guardar:

- `topic_key: feature/{{feature}}/clarify` → `status: APPROVED` (si se ejecutó, con preguntas hechas y respuestas del usuario) o `status: SKIPPED` (si todas las categorías quedaron en `Clear`).
- Actualizar `feature/{{feature}}/pipeline` → `current_phase: 3`.

**Al completar:** marcar `Fase 2` como `completed` en la todo list. Mostrar banner de transición:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  FEATURE: {{feature}}
  PHASE:   2 / 6 → COMPLETED ✅ (o SKIPPED ⏭️)
  PROGRESS: 33%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Fase 3 — Diseño Técnico

**Todo list:** marcar `Fase 3.1 — Dirección de diseño frontend [condicional]` y `Fase 3.2 — Plan técnico (@speckit-plan)` como `in_progress` (según corresponda).

### 3.1 — Dirección de diseño frontend (condicional)

Determinar si la feature tiene alcance frontend leyendo `spec.md` (user stories que mencionen UI, pantallas, componentes, o categoría UX cubierta).

- Si es **back-only** → saltear este paso y continuar directo al plan técnico. Marcar `Fase 3.1` como `completed` con nota "SKIPPED — back-only". Mostrar:
  ```
  ⏭️  Fase 3.1 SKIPPED — feature back-only, no requiere diseño frontend
  🔄 CURRENTLY: Avanzando directo a Fase 3.2 — Plan Técnico
  ```
- Si es **front-only** o **full-stack** → mostrar banner de actividad e invocar la skill `frontend-design`:

  ```
  ┌─────────────────────────────────────────────────────────────┐
  │  AGENT:        skill frontend-design                        │
  │  ACTION:       Definiendo dirección visual frontend         │
  │  EXPECTED:     specs/{{feature}}/frontend-design.md         │
  │  EST. TIME:    2-3 min                                      │
  │  PROGRESS:     33% → 42%                                    │
  └─────────────────────────────────────────────────────────────┘

  🔄 CURRENTLY: Generando dirección visual (tokens, tipografías, layout)
  ⏭️  UP NEXT:   Fase 3.2 — Plan Técnico (@speckit-plan)
  ```

  Invocar la skill `frontend-design` (`.agents/skills/frontend-design/SKILL.md`) con `spec.md` como brief y producir `specs/{feature}/frontend-design.md`:
  - **Grounding del brief**: subject concreto, audiencia y el único job de la página.
  - **Token system**: paleta de 4–6 hex nombrados, roles de tipografía (display + body + utility), concepto de layout, y el elemento firma único.
  - **Self-critique**: revisión del plan contra el brief, señalando qué se descartó por ser default genérico y por qué.
  - Aplicar la revisión antes de fijar el artefacto (no quedarse con la primera pasada).

Output esperado: `specs/{feature}/frontend-design.md`

### 3.2 — Plan técnico

**Todo list:** marcar `Fase 3.1` como `completed` (si corresponde) y `Fase 3.2 — Plan técnico (@speckit-plan)` como `in_progress`.

**Banner de actividad:**

```
┌─────────────────────────────────────────────────────────────┐
│  AGENT:        @speckit-plan                                │
│  ACTION:       Generando diseño técnico                     │
│  EXPECTED:     plan.md, data-model.md, contracts/           │
│  EST. TIME:    3-5 min                                      │
│  PROGRESS:     42% → 50%                                    │
└─────────────────────────────────────────────────────────────┘

🔄 CURRENTLY: Invocando @speckit-plan para generar el diseño técnico
⏭️  UP NEXT:   Fase 4 — Desglose de Tareas
```

Invocar el agente `@speckit-plan` para generar los artefactos de diseño técnico. Si existe `specs/{feature}/frontend-design.md`, indicarle que lo lea para alinear la sección frontend del plan (tokens, tipografías, layout) con la dirección visual.

Si la feature crea un dominio nuevo, el plan debe incluir
`specs/{feature}/contracts/operations.json` con este formato:

```json
{
  "apiOperations": ["getAll", "get", "create"],
  "uiViews": ["list", "detail", "new"]
}
```

`apiOperations` es la fuente única para backend y frontend. `uiViews` define
las superficies que debe scaffoldar el frontend; una vista `detail` requiere
la operación API `get`. Si la feature modifica un dominio existente, el
contrato puede marcarse como `not_applicable` y los agentes no deben ejecutar
los generators completos.

Output esperado en `specs/{feature}/`:

- `plan.md` (tech stack, estructura, fases)
- `data-model.md` (entidades, si aplica)
- `contracts/` (interfaces, si aplica)

### Restricciones

Aplicar la "Regla de interacción por fase": en `modo plan` esperar confirmación para iterar sobre `plan.md` (y `frontend-design.md` si aplica); en `modo auto` continuar salvo duda material o sugerencia explícita.

### Sync a Engram

Tras completar la fase (confirmada en `plan` o encadenada en `auto`), invocar la skill `engram-sync` y guardar:

- `topic_key: feature/{{feature}}/plan` → `status: APPROVED`, resumen de stack, estructura y fases, `Where: specs/{{feature}}/plan.md` (+ `data-model.md` y `contracts/` si aplica).
- `topic_key: feature/{{feature}}/frontend-design` → `status: APPROVED` (si aplica) o `status: SKIPPED` (si back-only), resumen de paleta, tipografías y elemento firma, `Where: specs/{feature}/frontend-design.md`.
- Actualizar `feature/{{feature}}/pipeline` → `current_phase: 4`.

**Al completar:** marcar `Fase 3.1` y `Fase 3.2` como `completed` en la todo list. Mostrar banner de transición:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  FEATURE: {{feature}}
  PHASE:   3 / 6 → COMPLETED ✅
  PROGRESS: 50%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Fase 4 — Desglose de Tareas

**Todo list:** marcar `Fase 4 — Desglose de tareas (@speckit-tasks)` como `in_progress`.

**Banner de actividad:**

```
┌─────────────────────────────────────────────────────────────┐
│  AGENT:        @speckit-tasks                               │
│  ACTION:       Desglosando tareas por user story            │
│  EXPECTED:     specs/{{feature}}/tasks.md                   │
│  EST. TIME:    2-3 min                                      │
│  PROGRESS:     50% → 66%                                    │
└─────────────────────────────────────────────────────────────┘

🔄 CURRENTLY: Invocando @speckit-tasks para generar el desglose de tareas
⏭️  UP NEXT:   Fase 5 — Análisis de Consistencia
```

Invocar el agente `@speckit-tasks` para generar `tasks.md` ordenado por user stories.

Output esperado: `specs/{feature}/tasks.md`

### Restricciones

Aplicar la "Regla de interacción por fase": en `modo plan` esperar confirmación para iterar sobre `tasks.md`; en `modo auto` continuar salvo duda material o sugerencia explícita.

### Sync a Engram

Tras completar la fase (confirmada en `plan` o encadenada en `auto`), invocar la skill `engram-sync` y guardar:

- `topic_key: feature/{{feature}}/tasks` → `status: APPROVED`, cantidad de user stories y de tareas, `Where: specs/{{feature}}/tasks.md`.
- Actualizar `feature/{{feature}}/pipeline` → `current_phase: 5`.

**Al completar:** marcar `Fase 4` como `completed` en la todo list. Mostrar banner de transición:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  FEATURE: {{feature}}
  PHASE:   4 / 6 → COMPLETED ✅
  PROGRESS: 66%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Fase 5 — Análisis de Consistencia

**Todo list:** marcar `Fase 5 — Análisis de consistencia (@speckit-analyze)` como `in_progress`.

**Banner de actividad:**

```
┌─────────────────────────────────────────────────────────────┐
│  AGENT:        @speckit-analyze                             │
│  ACTION:       Analizando consistencia entre artefactos     │
│  EXPECTED:     Reporte de consistencia                      │
│  EST. TIME:    1-2 min                                      │
│  PROGRESS:     66% → 83%                                    │
└─────────────────────────────────────────────────────────────┘

🔄 CURRENTLY: Invocando @speckit-analyze para validar consistencia
⏭️  UP NEXT:   Fase 6 — Handoff a @blendverse-implement
```

Invocar el agente `@speckit-analyze` para generar un reporte para asegurar que todos los documentos y artefactos sean consistentes entre sí.

Output esperado: Debes indicarle qué comando de `speckit` debe ejecutar si es necesario hacer un cambio.

### Restricciones

Aplicar la "Regla de interacción por fase": en `modo plan` esperar confirmación sobre el reporte de consistencia; en `modo auto` continuar salvo duda material o sugerencia explícita.

### Sync a Engram

Tras completar la fase (confirmada en `plan` o encadenada en `auto`), invocar la skill `engram-sync` y guardar:

- `topic_key: feature/{{feature}}/consistency` → `status: APPROVED`, inconsistencias detectadas y resueltas, comandos `speckit` ejecutados, `Where: specs/{{feature}}/`.
- Actualizar `feature/{{feature}}/pipeline` → `current_phase: 6`.

**Al completar:** marcar `Fase 5` como `completed` en la todo list. Mostrar banner de transición:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  FEATURE: {{feature}}
  PHASE:   5 / 6 → COMPLETED ✅
  PROGRESS: 83%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Fase 6 — Handoff a Blendverse

**Todo list:** marcar `Fase 6 — Handoff a @blendverse-implement` como `in_progress`.

**Banner de pipeline:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  FEATURE: {{feature}}
  PHASE:   6 / 6 — HANDOFF
  PROGRESS: 83% → 100% (tras delegar a @blendverse-implement)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Banner de actividad:**

```
┌─────────────────────────────────────────────────────────────┐
│  AGENT:        @blendverse-implement                        │
│  ACTION:       Iniciando cadena de implementación DDD       │
│  EXPECTED:     Implementación completa + PR a main          │
│  EST. TIME:    15-30 min (depende del scope)                │
│  PROGRESS:     83% → 100%                                   │
└─────────────────────────────────────────────────────────────┘

🔄 CURRENTLY: Delegando control a @blendverse-implement
⏭️  UP NEXT:   Cadena back → front → tester → qa → reviewer → PR
```

Presentar al usuario el resumen de artefactos:

```
✅ Pipeline Speckit completado:
   - spec.md     → user stories con criterios de aceptación
   - plan.md     → diseño técnico + stack
   - frontend-design.md → dirección visual (tokens, tipografías, firma) — si aplica
   - tasks.md    → tareas ordenadas por user story

📁 Artefactos en: specs/{feature}/
```

- En `modo plan`: las fases ya fueron aprobadas una a una; proceder directo al handoff.
- En `modo auto`: este es el **checkpoint único de revisión**. Usar la herramienta `question` para obtener la confirmación explícita antes de delegar (fork binario): opciones `Confirmar y delegar a @blendverse-implement` | `Iterar sobre algún artefacto`. Si elige iterar, volver a `modo plan` y re-ejecutar las fases afectadas.

### Sync a Engram

Antes de delegar, invocar la skill `engram-sync` y guardar:

- Actualizar `feature/{{feature}}/pipeline` → `status: COMPLETED` (registrar todas las fases aprobadas).
- `topic_key: feature/{{feature}}/handoff` → `status: HANDOFF`, `Where: specs/{{feature}}/`, indicando que el control pasa a `@blendverse-implement` (el `task_id` lo resolverá ese agente).

Luego,**sin esperar intervención del usuario**, invocar directamente el agente `@blendverse-implement` pasándole `{{feature}}` explícitamente en el prompt, por ejemplo:

> La feature a implementar es `{{feature}}`. Los artefactos de diseño están en `specs/{{feature}}/` (`spec.md`, `plan.md`, `tasks.md`, `contracts/operations.json` si crea un dominio nuevo y, si aplica, `frontend-design.md`). Resolvé el `task_id` (Paso 1 de tu protocolo) y procedé con la cadena `back → front → tester → qa → reviewer` de forma autónoma. Si existe `operations.json`, backend y frontend deben consumirlo con los generators; si el dominio ya existe, no deben ejecutar el generator completo. El generator solo crea scaffold técnico: los agentes deben implementar la lógica de negocio y UI específica de la feature después. El agente `@blendverse-front` debe leer y aplicar `frontend-design.md` como brief visual al implementar la capa de presentación. Usá la skill `engram-sync` para registrar la tarea y retomar si hay una tarea en curso. Una vez que `@blendverse-reviewer` apruebe (todas las validaciones corregidas) y la tarea quede cerrada, ejecutá el Paso 5 de tu protocolo: invocá el agente `pr-detail` para generar `pr-detail.md`, pusheá la rama y abrí el PR contra `main` con `gh pr create`, reportando la URL al usuario.

Este orquestador ya sabe leer `specs/{{feature}}/spec.md` y `tasks.md` directamente (sin transcribirlos a `memory/`), detectar el alcance e iniciar la cadena completa hasta el cierre de la tarea.

**Al completar el handoff:** marcar `Fase 6` como `completed` en la todo list. Mostrar banner final:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  FEATURE: {{feature}}
  PIPELINE SPECKIT → COMPLETED ✅
  PROGRESS: 100%
  HANDOFF:  @blendverse-implement (cadena de implementación)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Notas

- **`modo plan` (default)**: DETENTE ESTRICTAMENTE después de cada fase (1–5) y espera la confirmación explícita del usuario. NO pases a la siguiente fase sin que el usuario diga 'ok' o apruebe la fase anterior.
- **`modo auto`**: las fases 1–5 se ejecutan encadenadas sin aprobación por fase, siempre que la feature pase la Fase 0 (baja complejidad). Interrumpir y volver a `modo plan` solo ante dudas materiales o sugerencias explícitas del usuario.
- El checkpoint único de `modo auto` es antes de la Fase 6: presentar el resumen de artefactos antes de delegar la implementación.
- El gate de "Cambios Críticos" aplica en todas las fases que escriben artefactos: si se modifica un artefacto existente, mostrar siempre el bloque de cambios con motivo, y ante cualquier cambio CRÍTICO volver a `modo plan` incluso si el pipeline estaba en `auto`.

- La Fase 6 es completamente automática — no requiere intervención del usuario, e incluye el paso final de `@blendverse-reviewer`, el cierre de la tarea en `history_log.json` y la apertura del PR a `main`.
- Al cierre exitoso de la tarea (Fase 6), `@blendverse-implement` ejecuta su Paso 5: genera `pr-detail.md` con la skill `pr-detail`, pushea la rama y abre el PR contra `main` (requiere `gh` autenticado). El PR solo se crea cuando todas las validaciones (QA + reviewer) pasaron.
- El agente `@speckit-implement` redirige automáticamente a el agente `@blendverse-implement` — la implementación la realizan exclusivamente los agentes Blendverse especializados en DDD.
- Si el usuario quiere saltear las fases de diseño (ya tiene `spec.md`, `plan.md` y `tasks.md`), puede invocar directamente `@blendverse-implement` indicándole la `{feature}` — éste lee los artefactos Speckit directamente, sin transcribirlos.
- El comando `@speckit-to-blendverse` existe como transcripción standalone, pero no se usa en este pipeline: `@blendverse-implement` lee los artefactos Speckit directamente, sin necesidad de transcripción.
- Invocar `@speckit-clarify`, `@speckit-plan`, `@speckit-tasks` o `@speckit-analyze` puede disparar un prompt de auto-commit definido en `.specify/extensions.yml` (`before_clarify`, `before_plan`, `before_tasks`, `before_analyze`) preguntando si confirmar cambios pendientes antes de esa fase — es un comportamiento esperado de Speckit, no un error del pipeline.
- Si alguna de las fases demora más de 5 minutos, debes indicarle al usuario por pantalla y analizar por qué está demandando tanto tiempo.
- Cada fase aprobada se espeja en Engram (skill `engram-sync`). Si el pipeline se interrumpe entre sesiones, el pre-flight detecta `feature/{feature}/pipeline` en `IN_PROGRESS` y ofrece reanudar desde `current_phase`.
- La Fase 3.1 es **condicional al alcance UI**: para features back-only no se genera `frontend-design.md` y el espejo en Engram queda como `SKIPPED`. El artefacto define una **dirección visual** (tokens de color/tipografía/layout y elemento firma), no un mockup.
- La evaluación de `tsc` + `eslint` (skill `qa-runner`) y el fix automático de inconsistencias **no** ocurren en las Fases 1–5 (no hay código aún): ocurren en la cadena del handoff (Fase 6). `@blendverse-qa` valida estáticamente y escribe `03_qa_report.md`; `@blendverse-implement` re-invoca al Coder (`back`/`front`) con el error concreto hasta `PASS`. Cada agente cuenta sus propios intentos en su reporte; timeout, infraestructura y baseline no consumen intentos funcionales. Si el contador del agente activo llega a 3, se crea `memory/{task_id}/BLOCKED.md` y se detiene la cadena.
