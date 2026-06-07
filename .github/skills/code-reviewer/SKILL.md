# Skill: code-reviewer

## Propósito

Guía al agente `@blendverse.reviewer` en la revisión de estándares de arquitectura, seguridad y convenciones del proyecto, y en la generación del reporte `memory/{task_id}/04_review_log.md`.

---

## Checklist de Revisión (12 Ítems)

Los ítems marcados con 🔴 son **críticos** — un fallo en cualquiera de ellos resulta en `status: REJECTED`.  
Los ítems marcados con 🟡 son **recomendados** — un fallo genera feedback pero no bloquea la aprobación.

### Arquitectura Hexagonal

| #   | Criterio                                                                          | Nivel | Cómo verificar                                                                  |
| --- | --------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------- |
| 1   | La capa `Domain/` no importa de `Infrastructure/` ni de `Application/`            | 🔴    | Revisar `import` statements en `.entity.ts`, `.interfaces.ts`, `.repository.ts` |
| 2   | Los Use Cases no importan repositorios directamente — solo la interfaz abstracta  | 🔴    | Revisar imports en `*.usecase.ts`                                               |
| 3   | Los archivos globales de registro (`register.ts`, `Router.ts`) están actualizados | 🔴    | Verificar presencia del nuevo dominio en ambos archivos                         |

### TypeScript y Tipado

| #   | Criterio                                                                                  | Nivel | Cómo verificar                                            |
| --- | ----------------------------------------------------------------------------------------- | ----- | --------------------------------------------------------- |
| 4   | No existe ningún `any` explícito en los archivos afectados                                | 🔴    | Buscar `any` con grep en `affected_files`                 |
| 5   | Todos los métodos públicos tienen tipo de retorno explícito                               | 🟡    | Revisar firmas de métodos en entidad, use cases y service |
| 6   | Los tipos de interfaces (`I[Entity]`, `T[Entity]`) son los únicos compartidos entre capas | 🔴    | Verificar que no se importan clases concretas entre capas |

### Validación y Seguridad (OWASP)

| #   | Criterio                                                                            | Nivel | Cómo verificar                                                 |
| --- | ----------------------------------------------------------------------------------- | ----- | -------------------------------------------------------------- |
| 7   | Zod valida el input en el controller (backend) o en el formulario RHF (frontend)    | 🔴    | Verificar esquema Zod en `*.controller.ts` o en el formulario  |
| 8   | El filtro multi-tenant `ownerId` está aplicado en todas las queries del repositorio | 🔴    | Revisar `findAll`/`findOne` en `*Repository.implementation.ts` |
| 9   | No existe `console.log` ni `console.error` en código productivo                     | 🟡    | Buscar `console.` en `affected_files`                          |

### Convenciones de Nomenclatura

| #   | Criterio                                                                        | Nivel | Cómo verificar                                                                                 |
| --- | ------------------------------------------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------- |
| 10  | Los nombres de clases, archivos y carpetas siguen las convenciones del proyecto | 🔴    | Comparar contra las tablas de nomenclatura en `server.instructions.md` o `app.instructions.md` |
| 11  | La entidad implementa `static create()`, `toJSON()` y `get values()`            | 🟡    | Revisar la clase entidad                                                                       |

### Mantenibilidad

| #   | Criterio                                                                     | Nivel | Cómo verificar                                                  |
| --- | ---------------------------------------------------------------------------- | ----- | --------------------------------------------------------------- |
| 12  | El `index.ts` barrel del dominio exporta correctamente los símbolos públicos | 🟡    | Verificar que el barrel no re-exporta implementaciones privadas |

---

## Template Obligatorio — `04_review_log.md`

> **Regla de brevedad:** Si el resultado es `APPROVED`, el cuerpo se limita a la tabla del checklist. La sección de Feedback solo se escribe en `REJECTED`; la de Deuda Técnica solo si hay algo concreto que reportar.

````markdown
---
task_id: 'TASK-YYYYMMDD-N'
agent: 'Reviewer_Agent'
status: 'APPROVED' # APPROVED | REJECTED
attempts: 1 # incrementar en cada re-revisión
date: 'YYYY-MM-DD'
---

# Revisión de Estándares — [Título de la Tarea]

## Resultado: ✅ APPROVED / ❌ REJECTED

---

## Checklist

| #   | Criterio                                | Nivel | Estado | Detalle |
| --- | --------------------------------------- | ----- | ------ | ------- |
| 1   | Domain no importa Infrastructure        | 🔴    | ✅     | —       |
| 2   | Use Cases usan interfaz abstracta       | 🔴    | ✅     | —       |
| 3   | Archivos globales actualizados          | 🔴    | ✅     | —       |
| 4   | Sin `any` explícito                     | 🔴    | ✅     | —       |
| 5   | Tipos de retorno explícitos             | 🟡    | ✅     | —       |
| 6   | Solo interfaces compartidas entre capas | 🔴    | ✅     | —       |
| 7   | Zod en controller/formulario            | 🔴    | ✅     | —       |
| 8   | Filtro `ownerId` en queries             | 🔴    | ✅     | —       |
| 9   | Sin `console.log` en producción         | 🟡    | ✅     | —       |
| 10  | Convenciones de nomenclatura            | 🔴    | ✅     | —       |
| 11  | Entidad con `static create()` etc.      | 🟡    | ✅     | —       |
| 12  | Barrels exportan correctamente          | 🟡    | ✅     | —       |

---

## Feedback (solo si status: REJECTED)

### Ítem [N] — [Nombre del ítem]

**Problema:** [Descripción exacta del incumplimiento]

**Archivo afectado:** `ruta/al/archivo.ts` — línea X

**Solución esperada:**

```typescript
// Ejemplo de cómo debe quedar el código
```

---

## Deuda Técnica (solo si hay algo concreto)

- [Ítem subóptimo que debe atenderse en una tarea futura]
````

---

## Reglas de Calidad

1. **Completar el checklist completo** para todas las revisiones, aunque el resultado sea `APPROVED`.
2. **Si `status: REJECTED`**, la sección de Feedback es **obligatoria** con ejemplo de código correcto.
3. **No rechazar** por ítems 🟡 — solo generar feedback en "Deuda Técnica".
4. **`attempts`** comienza en `1` y se incrementa en cada re-revisión.
5. **Si `attempts >= 3`**, no escribir el reporte — ejecutar el Protocolo Break-Loop definido en `@blendverse.reviewer`.

```

```
