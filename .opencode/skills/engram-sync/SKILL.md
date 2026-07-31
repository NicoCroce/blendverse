---
name: engram-sync
description: Espeja en Engram (mem_save) cada fase del pipeline Speckit + Blendverse y cada artefacto de la cadena de implementación, y define los patrones de consulta para retomar pipelines/tareas interrumpidos. Invocar en blendverse-start-feature (pre-flight + fin de cada fase), en blendverse-implement (registro + cierre) y en los agentes worker al cierre de sesión.
---

# Skill: engram-sync

## Propósito

Mantener en Engram un espejo persistente de cada fase del pipeline `blendverse-start-feature` y de cada artefacto de la cadena `@blendverse-implement` → back/front → tester → qa → reviewer, habilitando la recuperación entre sesiones y la reanudación de trabajo interrumpido.

## Principio rector: los archivos son la fuente de verdad

- Los artefactos en disco (`specs/{feature}/`, `memory/{task_id}/`) siguen siendo **autoritativos**. Los agentes leen SIEMPRE de los archivos.
- Engram es un **espejo de estado** para detección de resume y recuperación entre sesiones. Nunca se usa para reconstruir contenido si el archivo existe.
- **Anti-divergencia:** antes de reanudar un pipeline o tarea, verificar en disco que el artefacto que el espejo dice completado realmente existe. Si falta el archivo pero existe el espejo, el espejo está obsoleto → regenerar la fase y sobrescribir el espejo.
- Si el espejo y el archivo se contradicen → **gana el archivo**. Corregir el espejo (`mem_save` con el mismo `topic_key`).

## Cuándo invocar esta skill

| Rol                                      | Momento                                                                                                  |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Comando `blendverse-start-feature`       | Pre-flight (resume + registro inicial) y al final de cada fase 1–6, **tras la confirmación del usuario** |
| `@blendverse-implement`                  | Paso 1 (registro/resume), al detectar punto de reanudación y Paso 4 (cierre)                             |
| `@blendverse-back` / `@blendverse-front` | Cierre de sesión, inmediatamente después de escribir `02_dev_log.md`                                     |
| `@blendverse-tester`                     | Inmediatamente después de escribir `05_test_log.md`                                                      |
| `@blendverse-qa`                         | Inmediatamente después de escribir `03_qa_report.md`                                                     |
| `@blendverse-reviewer`                   | Inmediatamente después de escribir `04_review_log.md`                                                    |

## Tabla de topic_keys

| Topic key                       | Artefacto / fase                                    | Quién espeja            |
| ------------------------------- | --------------------------------------------------- | ----------------------- |
| `feature/{feature}/pipeline`    | Estado global del pipeline de diseño                | Comando                 |
| `feature/{feature}/spec`        | Fase 1 — `specs/{feature}/spec.md`                  | Comando                 |
| `feature/{feature}/clarify`     | Fase 2 (condicional) — aclaraciones sobre `spec.md` | Comando                 |
| `feature/{feature}/plan`        | Fase 3 — `plan.md`, `data-model.md`, `contracts/`   | Comando                 |
| `feature/{feature}/tasks`       | Fase 4 — `tasks.md`                                 | Comando                 |
| `feature/{feature}/consistency` | Fase 5 — reporte de consistencia                    | Comando                 |
| `feature/{feature}/handoff`     | Fase 6 — handoff a `@blendverse-implement`          | Comando                 |
| `task/{task_id}/registration`   | Registro de la tarea (Paso 1 de implement)          | `@blendverse-implement` |
| `task/{task_id}/dev-log`        | `memory/{task_id}/02_dev_log.md`                    | back/front              |
| `task/{task_id}/test-log`       | `memory/{task_id}/05_test_log.md`                   | tester                  |
| `task/{task_id}/qa-report`      | `memory/{task_id}/03_qa_report.md`                  | qa                      |
| `task/{task_id}/review-log`     | `memory/{task_id}/04_review_log.md`                 | reviewer                |
| `task/{task_id}/status`         | Cierre de la tarea (Paso 4)                         | `@blendverse-implement` |

## Cómo guardar (`mem_save`)

Reglas obligatorias para TODOS los espejos:

- `topic_key`: el de la tabla, con `{feature}` / `{task_id}` reales.
- `capture_prompt: false` — es un espejo de artefacto automatizado, no una decisión humana.
- `scope: project` (default). `project`: el detectado por Engram para el monorepo (ej. `gestdoc`).
- `title`: corto y buscable, incluye feature o task_id (ej. `Fase 1 Spec — multiempresas-usuarios`).
- `content`: incluir SIEMPRE la línea `topic_key: <valor real>` para que sea verificable al recuperar.
- **Upsert por re-iteración:** la misma fase/artefacto en una iteración nueva (ej. reviewer REJECTED → APPROVED) usa el **mismo** `topic_key` y sobrescribe con los valores nuevos (`attempts`, `status`). No generar topic_keys por intento.
- **No espejar estados sin confirmar:** a nivel comando solo se espeja la fase tras la confirmación explícita del usuario. A nivel worker, solo tras escribir el archivo definitivo de esa iteración.

### Formato de contenido

```
**What**: <artefacto o fase y estado, en una oración>
**Why**: <contexto del pipeline o de la tarea>
**Where**: <rutas de los artefactos en disco>
**Learned**: <decisiones técnicas, dudas resueltas, riesgos, deuda técnica>

topic_key: <topic_key real>
status: <APROBADO según tabla de estados>
```

Estados válidos por artefacto:

| Artefacto                                 | Estados                                   |
| ----------------------------------------- | ----------------------------------------- |
| `pipeline`                                | `IN_PROGRESS` \| `COMPLETED`              |
| `spec` / `plan` / `tasks` / `consistency` | `APPROVED`                                |
| `clarify`                                 | `APPROVED` \| `SKIPPED`                   |
| `handoff`                                 | `HANDOFF`                                 |
| `registration` / `status`                 | `IN_PROGRESS` \| `COMPLETED` \| `BLOCKED` |
| `dev-log`                                 | `IMPLEMENTED` \| `IN_PROGRESS`            |
| `test-log` / `qa-report`                  | `PASS` \| `FAIL`                          |
| `review-log`                              | `APPROVED` \| `REJECTED`                  |

Campos adicionales según el artefacto (opcionales salvo `status`):

| Artefacto      | Campos extra                                                                           |
| -------------- | -------------------------------------------------------------------------------------- |
| `pipeline`     | `current_phase: <N>` (próxima fase a ejecutar), `branch`, `approved_phases: [..]`      |
| `spec`         | `user_stories: <n>`                                                                    |
| `plan`         | `stack: <resumen>`, `fases: <resumen>`                                                 |
| `tasks`        | `user_stories: <n>`, `task_count: <n>`                                                 |
| `handoff`      | `task_id`, `scope` si ya se conoce                                                     |
| `registration` | `feature`, `scope` (`back-only`/`front-only`/`full-stack`), `context_source`, `branch` |
| `dev-log`      | `agent` (`Back_Agent`/`Front_Agent`), `attempts`, `affected_files` (resumen)           |
| `test-log`     | `agent` (`Tester_Agent`), `attempts`, `reglas_validadas: <n>`                          |
| `qa-report`    | `agent` (`QA_Agent`), `attempts`                                                       |
| `review-log`   | `agent` (`Reviewer_Agent`), `attempts`                                                 |
| `status`       | `agents_chain` (resumen: agente → estado)                                              |

## Cómo consultar (resume)

### Patrón 1 — ¿Hay un pipeline de diseño en curso?

```
mem_search(query: "pipeline {feature}", project: "<proyecto>")
```

Si existe una observación con `topic_key: feature/{feature}/pipeline`:

- `status: IN_PROGRESS` → pipeline en curso. Leer `current_phase` = próxima fase a ejecutar. Verificar en disco que `specs/{feature}/` contiene los artefactos de las fases previas antes de reanudar.
- `status: COMPLETED` → pipeline de diseño terminado; no duplicar fases. Si no se hizo aún el handoff, ir directo a la Fase 6.

### Patrón 2 — ¿Hay una tarea de implementación en curso?

```
mem_search(query: "task {task_id} status", project: "<proyecto>")
mem_search(query: "task {task_id} registration", project: "<proyecto>")
```

- `status` COMPLETED → tarea ya cerrada; no reabrir. Informar y detener.
- `status` BLOCKED → informar que requiere intervención humana; detener.
- `registration` IN_PROGRESS → reutilizar `task_id`, `scope` y `context_source` sin re-derivarlos.

### Patrón 3 — ¿Dónde se cortó la cadena de implementación?

Buscar los espejos `task/{task_id}/*` y usar el **último espejo presente** para decidir el punto de reanudación:

| Último espejo presente | Estado        | Punto de reanudación                                        |
| ---------------------- | ------------- | ----------------------------------------------------------- |
| `review-log`           | `APPROVED`    | Solo cerrar: actualizar `task/{task_id}/status` a COMPLETED |
| `review-log`           | `REJECTED`    | Coder (con feedback del review) → tester → qa → reviewer    |
| `qa-report`            | `FAIL`        | Coder (con error del QA) → tester → qa                      |
| `qa-report`            | `PASS`        | Reviewer                                                    |
| `test-log`             | `FAIL`        | Tester (corregir/re-ejecutar)                               |
| `test-log`             | `PASS`        | QA                                                          |
| `dev-log`              | `IMPLEMENTED` | Tester                                                      |
| `registration` (solo)  | `IN_PROGRESS` | Inicio de la cadena según `scope`                           |
| ninguno                | —             | Cadena completa desde el inicio según `scope`               |

Siempre verificar el archivo correspondiente en `memory/{task_id}/` antes de actuar: el espejo indica estado, el archivo es el contenido.

## Regla de oro

Si el espejo y el archivo se contradicen → **gana el archivo**. Corregir el espejo (`mem_save` con el mismo `topic_key`) para que refleje la realidad del disco.
