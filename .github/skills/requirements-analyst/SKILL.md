# Skill: requirements-analyst

## Propósito

Guía al agente `@blendverse.analyst` para transformar el input del usuario en un documento de requerimientos estructurado (`memory/{task_id}/01_requirements.md`), listo para ser consumido por los agentes de desarrollo.

---

## Protocolo de Análisis

Antes de escribir el archivo, responder estas preguntas internamente:

1. ¿Cuál es la necesidad central del usuario en una sola oración?
2. ¿Qué dominio/s del monorepo se ven afectados? (server, app, o ambos)
3. ¿Existen dominios ya creados que deben modificarse?
4. ¿Hay dependencias con otros dominios? (usar skill `cross-domain-relations` si aplica)
5. ¿Hay ambigüedades que requieran preguntar al usuario antes de continuar?

Si la respuesta a (5) es sí, **listar las preguntas al usuario antes de escribir el archivo**.

---

## Template Obligatorio — `01_requirements.md`

```markdown
---
task_id: 'TASK-YYYYMMDD-N'
agent: 'Analyst_Agent'
status: 'DONE'
version: '1.0.0'
date: 'YYYY-MM-DD'
---

# Requerimientos: [Título de la Tarea]

## Descripción de la Necesidad

[Breve resumen en 2-3 oraciones de lo que el usuario quiere lograr y por qué.]

## Alcance

- **Incluye:** [lista concreta de lo que entra en esta tarea]
- **Excluye:** [lista de lo que explícitamente NO se hace aquí]

## Dominio Afectado

| Capa   | Dominio         | Tipo de cambio       |
| ------ | --------------- | -------------------- |
| server | [NombreDominio] | Nuevo / Modificación |
| app    | [NombreDominio] | Nuevo / Modificación |

**Tipo de tarea:** `full-stack` | `solo-backend` | `solo-frontend`

## User Stories

### US-01: [Título corto]

**Como** [rol del usuario], **quiero** [acción o funcionalidad], **para** [beneficio o valor obtenido].

**Criterios de Aceptación:**

- [ ] [Criterio técnico o funcional concreto y verificable]
- [ ] [Ej: El endpoint devuelve 400 si falta el campo `nombre`]
- [ ] [Ej: El filtro multi-tenant por `ownerId` está aplicado en la query]
- [ ] [Ej: El formulario muestra el error de validación en tiempo real]

### US-02: [Título corto]

[Repetir estructura para cada User Story]

## Propuestas de Mejora UX

- **[Área]:** [Descripción de la mejora proactiva que enriquece la experiencia sin alterar el alcance]

## Dependencias con Dominios Existentes

| Dominio Proveedor | Tipo de Relación | Skill a usar             |
| ----------------- | ---------------- | ------------------------ |
| [NombreDominio]   | Obtener por IDs  | `cross-domain-relations` |

_Si no hay dependencias, escribir: "Sin dependencias cross-domain."_

## Estimación de Complejidad

- **Nivel:** Baja | Media | Alta
- **Motivo:** [Justificación en 1-2 oraciones]
```

---

## Reglas de Calidad

1. **Cada criterio de aceptación debe ser verificable** — evitar criterios vagos como "que funcione bien".
2. **Mencionar `ownerId`** explícitamente cuando la User Story involucra datos del servidor.
3. **Alcance Excluye** debe estar completo — anticipar lo que el Coder podría hacer de más.
4. **Máximo 3 User Stories por tarea** — si hay más, dividir en múltiples tareas.
5. **Versión** empieza en `"1.0.0"` y se incrementa si el analista reescribe el archivo por cambio de requerimientos.
