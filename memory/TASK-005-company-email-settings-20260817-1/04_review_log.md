---
task_id: 'TASK-005-company-email-settings-20260817-1'
agent: 'Reviewer_Agent'
status: 'REJECTED'
attempts: 2
date: '2026-08-17'
---

# Revisión de Estándares — Company Email Settings

## Resultado: ❌ REJECTED

---

## Checklist

| #   | Criterio                                | Nivel | Estado | Detalle                                                                                                                                                 |
| --- | --------------------------------------- | ----- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Domain no importa Infrastructure        | 🔴    | ✅     | —                                                                                                                                                       |
| 2   | Use Cases usan interfaz abstracta       | 🔴    | ✅     | —                                                                                                                                                       |
| 3   | Archivos globales actualizados          | 🔴    | ✅     | —                                                                                                                                                       |
| 4   | Sin `any` explícito                     | 🔴    | ✅     | —                                                                                                                                                       |
| 5   | Tipos de retorno explícitos             | 🟡    | ⚠️     | Persisten métodos públicos sin retorno explícito en `CompanyEmailSettingsService`; no bloquea.                                                          |
| 6   | Solo interfaces compartidas entre capas | 🔴    | ❌     | `Application/Services/SendEmail.service.ts` importa y aplica el decorator de email desde `@server/Infrastructure`.                                      |
| 7   | Zod en controller/formulario            | 🔴    | ✅     | —                                                                                                                                                       |
| 8   | Filtro `ownerId` en queries             | 🔴    | ❌     | Los includes de aceptaciones en `DisclaimerRepository.implementation.ts` filtran por `terms_version_id`, pero no por `id_empresa` del `RequestContext`. |
| 9   | Sin `console.log` en producción         | 🟡    | ⚠️     | `Disclaimer/Application/UseCases/SendReminders.usecase.ts:80`; no bloquea.                                                                              |
| 10  | Convenciones de nomenclatura            | 🔴    | ✅     | —                                                                                                                                                       |
| 11  | Entidad con `static create()` etc.      | 🟡    | ✅     | —                                                                                                                                                       |
| 12  | Pantallas con error/loading/empty       | 🔴    | ✅     | —                                                                                                                                                       |
| 13  | Sin texto inline para estados           | 🔴    | ✅     | —                                                                                                                                                       |
| 14  | Botones con `isLoading`                 | 🔴    | ✅     | —                                                                                                                                                       |
| 15  | Empty states usan `EmptyState`          | 🟡    | ✅     | —                                                                                                                                                       |
| 16  | Skeletons en Components/ del dominio    | 🟡    | ✅     | —                                                                                                                                                       |
| 17  | Barrels exportan correctamente          | 🟡    | ✅     | —                                                                                                                                                       |

---

## Feedback

### Ítem 6 — Decorator fuera de Infrastructure

**Problema:** El decorator institucional se ejecuta desde `packages/server/src/Application/Services/SendEmail.service.ts` antes de `MailNotificationService.sendOne()`. La composición debe permanecer en adapters de `Infrastructure`, no en Application.

**Archivo afectado:** `packages/server/src/Application/Services/SendEmail.service.ts:6,90,183,203,261`.

**Solución esperada:** Mover la composición a un adapter de `Infrastructure`, inmediatamente antes de cada `sendOne`; Application debe transportar el código/mensaje mediante un puerto y no importar `applyInstitutionalWelcome`.

### Ítem 8 — Tenant scope en aceptación de términos

**Problema:** Las asociaciones `DisclaimerAcceptanceModel` usadas por las consultas de empleados no restringen `id_empresa` al tenant contextual; una fila de aceptación con el mismo usuario/versión puede contaminar el estado de otra empresa.

**Archivo afectado:** `packages/server/src/domains/Disclaimer/Infrastructure/Database/DisclaimerRepository.implementation.ts:164-169,276-281`.

**Solución esperada:** Agregar `id_empresa: requestContext.values.ownerId` a ambos `include.where` y conservar el filtro contextual en todas las lecturas de aceptación.

### Gate funcional — `termsVersion` no llega desde el frontend

**Problema:** `DisclaimerController.sign` exige `termsVersion`, pero `DisclaimerForm` todavía ejecuta `mutate({ password } as never)`. La aceptación real siempre omite la versión y es rechazada por Zod antes de persistir.

**Archivos afectados:** `packages/server/src/domains/Disclaimer/Infrastructure/Controllers/Disclaimer.controller.ts:29-33`, `packages/app/src/Domains/Disclaimer/DisclaimerForm.tsx:38-40`.

**Solución esperada:** Exponer la versión vigente junto con el texto mostrado, pasar `termsVersion` en la mutación y eliminar el cast `as never`; ante una versión stale, forzar recarga y nueva confirmación.

### Gate funcional — reprovisionamiento de destinatarios eliminados

**Problema:** `ensure()` vuelve a insertar los administradores legacy en cada resolución, incluso cuando la configuración ya existe. Al eliminar el último destinatario, el siguiente `get`/policy lo recrea y rompe el hard delete y la lista explícita por empresa.

**Archivo afectado:** `packages/server/src/domains/CompanyEmailSettings/Infrastructure/Database/CompanyEmailSettingsRepository.implementation.ts:88-107`.

**Solución esperada:** Importar legacy admins solo al crear/provisionar inicialmente la configuración; las ejecuciones posteriores deben respetar la colección persistida y no reinsertar filas eliminadas.
