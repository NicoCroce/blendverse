# Skill: dev-logger

## Propósito

Guía a los agentes `@blendverse.back` y `@blendverse.front` para registrar un log detallado al final de cada sesión de implementación (`memory/{task_id}/02_dev_log.md`). Este archivo es la entrada principal de `@blendverse.qa` y `@blendverse.reviewer`.

---

## Cuándo invocar esta skill

Esta skill debe ejecutarse **siempre como último paso** de cualquier sesión de `@blendverse.back` o `@blendverse.front`, inmediatamente después de verificar que no hay errores de TypeScript en los archivos creados.

---

## Protocolo

### Paso 1 — Obtener el task_id activo

Leer `memory/history_log.json` para obtener el `task_id` de la tarea en curso.  
Si ya existe `memory/{task_id}/02_dev_log.md` de una iteración anterior, leerlo para conocer el valor actual de `attempts` e incrementarlo en 1.

### Paso 2 — Construir la lista de archivos afectados

Listar **todos** los archivos creados o modificados en la sesión con su ruta completa desde la raíz del monorepo.

### Paso 3 — Documentar decisiones técnicas

Para cada decisión no obvia, explicar brevemente:

- Qué patrón se usó y por qué.
- Por qué se descartó una alternativa (si aplica).

### Paso 4 — Escribir `02_dev_log.md`

Crear o sobreescribir `memory/{task_id}/02_dev_log.md` con el template a continuación.

---

## Template Obligatorio — `02_dev_log.md`

```markdown
---
task_id: 'TASK-YYYYMMDD-N'
agent: 'Back_Agent' # Back_Agent | Front_Agent
status: 'IMPLEMENTED'
attempts: 1 # incrementar en cada re-iteración
date: 'YYYY-MM-DD'
affected_files:
  - 'packages/server/src/domains/X/Domain/X.entity.ts'
  - 'packages/server/src/domains/X/Application/UseCases/CreateX.usecase.ts'
---

# Log de Desarrollo — [Título de la Tarea]

## Archivos Creados

| Archivo                                                  | Capa        | Motivo                        |
| -------------------------------------------------------- | ----------- | ----------------------------- |
| `packages/server/src/domains/X/Domain/X.entity.ts`       | Domain      | Entidad principal del dominio |
| `packages/server/src/domains/X/Application/X.service.ts` | Application | Orquestador de use cases      |

## Archivos Modificados

| Archivo                                               | Cambio aplicado                              |
| ----------------------------------------------------- | -------------------------------------------- |
| `packages/server/src/domains/register.ts`             | Registro del módulo Awilix del nuevo dominio |
| `packages/server/src/Infrastructure/Routes/Router.ts` | Montaje de la ruta tRPC del dominio          |

## Decisiones Técnicas

- **[Decisión 1]:** [Descripción de la decisión y justificación]
- **[Decisión 2]:** [Descripción de la decisión y justificación]

## Deuda Técnica Conocida

- [Ítem de deuda técnica si aplica — ej: validación adicional pendiente en campo X]

_Si no hay deuda técnica, escribir: "Sin deuda técnica registrada."_
```

---

## Reglas de Calidad

1. **`affected_files` debe ser exhaustivo** — incluir todos los archivos tocados, incluso los de registro global.
2. **`attempts`** comienza en `1` y se incrementa en `1` por cada re-iteración (si QA o Reviewer rechazan y el Coder vuelve a trabajar).
3. **No incluir** archivos de `node_modules`, `.lock`, o archivos de configuración no modificados.
4. **Rutas absolutas desde la raíz del monorepo** — siempre con `packages/server/` o `packages/app/` como prefijo.
