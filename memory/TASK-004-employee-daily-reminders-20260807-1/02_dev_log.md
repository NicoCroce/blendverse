---
task_id: 'TASK-004-employee-daily-reminders-20260807-1'
agent: 'Back_Agent'
status: 'IMPLEMENTED'
attempts: 3
date: '2026-08-07'
affected_files:
  - 'packages/server/src/domains/EmployeeReminders/Domain/EmployeeEmailSender.port.ts'
  - 'packages/server/src/domains/EmployeeReminders/Domain/EmployeePendingSection.types.ts'
  - 'packages/server/src/domains/EmployeeReminders/Domain/EmployeeReminder.entity.ts'
  - 'packages/server/src/domains/EmployeeReminders/Application/employeeReminders.types.ts'
  - 'packages/server/src/domains/EmployeeReminders/Application/EmployeeReminders.service.ts'
  - 'packages/server/src/domains/EmployeeReminders/Application/UseCases/GenerateDailyReminder.usecase.ts'
  - 'packages/server/src/domains/EmployeeReminders/Application/UseCases/SendEmployeeReminderEmail.usecase.ts'
  - 'packages/server/src/domains/EmployeeReminders/Application/UseCases/NotifyNewDocument.usecase.ts'
  - 'packages/server/src/domains/EmployeeReminders/Infrastructure/Email/EmployeeEmailSender.implementation.ts'
  - 'packages/server/src/domains/EmployeeReminders/Infrastructure/Scheduler/EmployeeReminders.scheduler.ts'
  - 'packages/server/src/domains/EmployeeReminders/Infrastructure/Controllers/EmployeeReminders.controller.ts'
  - 'packages/server/src/domains/Documents/Domain/Document.repository.ts'
  - 'packages/server/src/domains/Documents/Application/documents.types.ts'
  - 'packages/server/src/domains/Documents/Application/UseCases/GetPendingDocumentsByEmployee.usecase.ts'
  - 'packages/server/src/domains/Documents/Application/UseCases/IngestDocument.usecase.ts'
  - 'packages/server/src/domains/Documents/Application/Documents.service.ts'
  - 'packages/server/src/domains/Documents/Infrastructure/Database/DocumentsRepository.implementation.ts'
  - 'packages/server/src/domains/Documents/Infrastructure/Controllers/Documents.controller.ts'
  - 'packages/server/src/Infrastructure/utils/Email/Templates/employeeDailyReminder.template.ts'
  - 'packages/server/src/Infrastructure/utils/Email/Templates/newDocumentNotification.template.ts'
  - 'packages/server/src/Infrastructure/utils/Email/Templates/types.ts'
  - 'packages/server/src/Infrastructure/utils/emailUtils.ts'
  - 'packages/server/src/domains/register.ts'
  - 'packages/server/src/Infrastructure/Routes/Router.ts'
  - 'packages/server/src/index.ts'
---

# Log de Desarrollo — Recordatorios diarios por email para empleados + notificación en tiempo real de documento nuevo

## Archivos Creados

| Archivo                                                                                                    | Capa            | Motivo                                                                        |
| ---------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------- |
| `packages/server/src/domains/EmployeeReminders/Domain/EmployeeEmailSender.port.ts`                         | Domain          | Puerto abstracto `IEmployeeEmailSender` (desacopla Application de Nodemailer) |
| `packages/server/src/domains/EmployeeReminders/Domain/EmployeePendingSection.types.ts`                     | Domain          | Tipos de las secciones de pendientes del email                                |
| `packages/server/src/domains/EmployeeReminders/Domain/EmployeeReminder.entity.ts`                          | Domain          | Entidad `EmployeeReminder` con regla `shouldSend` (FR-010)                    |
| `packages/server/src/domains/EmployeeReminders/Application/employeeReminders.types.ts`                     | Application     | Schemas/tipos Input/Output de los use cases                                   |
| `packages/server/src/domains/EmployeeReminders/Application/EmployeeReminders.service.ts`                   | Application     | Orquesta batch diario por empresa con resiliencia (FR-003/FR-008)             |
| `packages/server/src/domains/EmployeeReminders/Application/UseCases/GenerateDailyReminder.usecase.ts`      | Application     | Genera los `EmployeeReminder` de una empresa                                  |
| `packages/server/src/domains/EmployeeReminders/Application/UseCases/SendEmployeeReminderEmail.usecase.ts`  | Application     | Envía el email por empleado vía puerto `IEmployeeEmailSender`                 |
| `packages/server/src/domains/EmployeeReminders/Application/UseCases/NotifyNewDocument.usecase.ts`          | Application     | Notificación inmediata de documento nuevo (cross-domain)                      |
| `packages/server/src/domains/EmployeeReminders/Infrastructure/Email/EmployeeEmailSender.implementation.ts` | Infrastructure  | Implementación Nodemailer del puerto (patrón DailyReport)                     |
| `packages/server/src/domains/EmployeeReminders/Infrastructure/Scheduler/EmployeeReminders.scheduler.ts`    | Infrastructure  | Cron `0 9 * * *` TZ `America/Argentina/Buenos_Aires`                          |
| `packages/server/src/domains/EmployeeReminders/Infrastructure/Controllers/EmployeeReminders.controller.ts` | Infrastructure  | Procedure `sendDailyReminders` (trigger manual)                               |
| `packages/server/src/domains/Documents/Application/UseCases/GetPendingDocumentsByEmployee.usecase.ts`      | Application     | Expone pendientes de UN empleado (consumido por EmployeeReminders)            |
| `packages/server/src/domains/Documents/Application/UseCases/IngestDocument.usecase.ts`                     | Application     | Punto de ingreso US6 + notificación real-time (FR-011..FR-016)                |
| `packages/server/src/Infrastructure/utils/Email/Templates/employeeDailyReminder.template.ts`               | Infra Templates | Template `{ subject, body }` del recordatorio diario                          |
| `packages/server/src/Infrastructure/utils/Email/Templates/newDocumentNotification.template.ts`             | Infra Templates | Template `{ subject, body }` de documento nuevo                               |
| `packages/server/src/Infrastructure/utils/emailUtils.ts`                                                   | Infra Utils     | Helper puro `isValidEmail` (regla helpers compartidos)                        |

## Archivos Modificados

| Archivo                                                                                                | Cambio aplicado                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/server/src/domains/Documents/Domain/Document.repository.ts`                                  | +`getPendingDocumentsByEmployee` / +`createDocuments` y contratos                                                                                       |
| `packages/server/src/domains/Documents/Application/documents.types.ts`                                 | +`IngestDocumentSchema`, `IIngestDocument*`, `IGetPendingDocumentsByEmployee`                                                                           |
| `packages/server/src/domains/Documents/Application/Documents.service.ts`                               | +`ingestDocument`                                                                                                                                       |
| `packages/server/src/domains/Documents/Infrastructure/Database/DocumentsRepository.implementation.ts`  | Implementación de los 2 métodos nuevos; `createDocuments` valida pertenencia de `employeeId` al owner antes del `bulkCreate` (multi-tenant, fix review) |
| `packages/server/src/domains/Documents/Infrastructure/Controllers/Documents.controller.ts`             | +procedure `ingestDocument`                                                                                                                             |
| `packages/server/src/domains/Documents/Application/UseCases/specs/SendDocumentToEmail.usecase.spec.ts` | Mock de `DocumentRepository` extendido (2 métodos) para mantener tsc                                                                                    |
| `packages/server/src/Infrastructure/utils/Email/Templates/index.ts`                                    | Registro de `employeeDailyReminder` y `newDocumentNotification` en `emailTemplates`                                                                     |
| `packages/server/src/Infrastructure/utils/Email/Templates/types.ts`                                    | +`IEmployeeDailyReminder` / +`INewDocumentNotificationTemplate`                                                                                         |
| `packages/server/src/Infrastructure/index.ts`                                                          | Exporta `utils/emailUtils`                                                                                                                              |
| `packages/server/src/domains/register.ts`                                                              | +`...employeeRemindersApp`                                                                                                                              |
| `packages/server/src/Infrastructure/Routes/Router.ts`                                                  | +`...EmployeeRemindersRoutes()`                                                                                                                         |
| `packages/server/src/index.ts`                                                                         | +`employeeRemindersScheduler().init()`                                                                                                                  |
| `docs/email-notifications.md`                                                                          | Casos #7 y #8 documentados (definition of done skill email-notifications)                                                                               |

## Decisiones Técnicas

- **[Puerto hexagonal `IEmployeeEmailSender`]:** replico el patrón `IDailyReportEmailSender` de DailyReport: la capa Application depende de un puerto, la infraestructura implementa con `MailNotificationService.sendOne()` (Nodemailer). Evita acoplar la capa Application a Nodemailer y facilita el mock en tests.
- **[Cross-domain `_notifyNewDocument`]:** `NotifyNewDocument` vive en `EmployeeReminders` (dueño del email) y `IngestDocument` (dominio Documents) lo inyecta por el key global `_notifyNewDocument`. No se re-registra en `documents.di.ts` (regla: el use case vive en el .di.ts del dominio dueño). Se resolvió el empleado con `_getUser` (Users) para `mail/name/surname` y `companyName` con `_getAllActiveOwners` (Users).
- **[Paginación de `_getEmployeesByCompany`]:** el use case de Disclaimer es paginado (limit default 10). Se usa `page: '1'`, `limit: MAX_EMPLOYEES_LIMIT = '100000'` para recorrer todos los empleados de la empresa. Alternativa descartada: llamadas paginadas múltiples (más complejo sin beneficio para el tamaño actual).
- **[Flags en el repositorio]:** `getPendingDocumentsByEmployee` hace UNA query con `Op.or: [{firmado: null}, {visualizado: null}]` e incluye `UserModel` con `where: { id_propietario: ownerId }` (multi-tenant, Pr. II). Devuelve `isUnsigned`/`isUnviewed` para que el use case arme las secciones del email.
- **[`createDocuments` omite sin `employeeId`]:** el data-model asumía `Usuario_id` nullable, pero la tabla real en BD es **NOT NULL** (verificado contra la base). Los ítems sin destinatario se omiten y se loguean con `logger.warn` (FR-014: sin asignación → sin notificación); el use case solo recibe los persistidos.
- **[Validación multi-tenant en `createDocuments` (fix review, attempts=2)]:** se validan los `employeeId` contra `UserModel` con `where: { id: { [Op.in]: employeeIds }, id_propietario: ownerId }` ANTES del `bulkCreate`. Los documentos dirigidos a empleados de otro tenant se omiten y se loguean con `logger.warn` (`skippedForeign`). Sin este filtro, un usuario del tenant A podía escribir documentos asignados a empleados del tenant B (IDOR write / Broken Access Control OWASP A01), violando Pr. II y la regla multi-tenant de `server.instructions.md`. Se implementó en el repositorio (opción 1 de la review); la alternativa equivalente en `IngestDocument` con `_getUser` quedó descartada porque duplicaría la query y fragmentaría la responsabilidad de pertenencia en la capa de persistencia.
- **[Resiliencia de `IngestDocument`]:** catch por empleado alrededor de `_getUser` + `_notifyNewDocument`: un fallo de resolución o de SMTP NO bloquea el ingreso del documento (FR-015). Devuelve `{ documentIds, notified }` agregado.
- **[`SendEmployeeReminderEmail` devuelve `{sent: boolean}`]:** el use case no cuenta (devuelve si se envió o se omitió); el service cuenta `sent/skipped/failed` globales. Evita doble contabilidad en el orquestador.
- **[Contexto sintético en el service]:** `new RequestContext(0, 'employee-reminders-{ownerId}-{ts}', owner.id)` porque el cron no tiene usuario autenticado; el `ownerId` del contexto es el tenant que filtran los repositorios.
- **[Helpers compartidos]:** `isValidEmail` va en `Infrastructure/utils/emailUtils.ts` (función pura, regla de helpers) y se exporta desde `@server/Infrastructure`. Los templates reusan `renderSection`, `emailFooter` y `formatDateEs` de `Templates/shared.ts`.
- **[Scheduler idempotente]:** `init()` con guard para no duplicar cron y `stop()`; `0 9 * * *` con `America/Argentina/Buenos_Aires` (mismo cron que DailyReport). Se inicializa en `src/index.ts` tras `registerDI`.
- **[`formatDate` compartido (fix deuda técnica, attempts=2)]:** `GenerateDailyReminder.usecase.ts` usaba `todayISO()` inline (`new Date().toISOString().split('T')[0]`) duplicando el helper `formatDate` de `Infrastructure/utils/dateUtils.ts`. Se reemplazó por `formatDate(new Date())` importado desde `@server/Infrastructure` (regla de utilidades compartidas). El spec `GenerateDailyReminder.usecase.spec.ts` extendió el mock de `@server/Infrastructure` con `formatDate` para mantener los tests verdes.
- **[Fix de compilación del spec del repositorio (attempts=3, QA fail attempts=2):]** el spec `DocumentsRepository.implementation.spec.ts` agregado por el Tester usaba `await import(...)` top-level (líneas 38-40), lo que forzaba el contexto ESM del archivo y, con `moduleResolution: NodeNext` (CJS sin `"type": "module"`), rompía la resolución de imports relativos (TS2835: falta `../index.js`) y de los path aliases `@server/domains/Users` / `@server/Infrastructure/utils/pino` (TS2307), además de lanzar TS1309 (top-level await en CJS). También importaba `IDocumentToCreate` desde `@server/domains/Documents/Domain/Document.types`, que no lo exporta (TS2305) — el tipo vive en `Document.repository.ts` y se exporta por el barrel `@server/domains/Documents/Domain`. Se reemplazaron los `await import(...)` por imports estáticos síncronos en el header del archivo (los `vi.mock` hoisted ya cubren el mock de `../index`, `@server/domains/Users` y `@server/Infrastructure/utils/pino`) y se corrigió el tipo al barrel correcto. No se modificó comportamiento de los tests: las 4 aserciones de la regla multi-tenant de `createDocuments` (pertenencia de `employeeId` al `ownerId`, `skippedForeign`, `[]` sin persistibles) se mantienen. Verificado: `tsc --noEmit` 0 errores, `vitest run` 281 passed / 0 failed, eslint sin errores.

## Deuda Técnica Conocida

- Los emails fallidos no se reintentan dentro del mismo ciclo (política heredada del proyecto, misma que los casos existentes); el batch diario los vuelve a cubrir al día siguiente.
- `newDocumentNotification` lista solo títulos de documentos; un link directo al documento en el frontend es una mejora futura (requiere URL pública de documento).
- `console.log('Hacer algo con userID', ...)` pre-existentes en `DocumentsRepository.implementation.ts` (getDocument/viewDocument/signDocument) — no son de esta feature, pero conviene limpiarlos en una tarea futura.
