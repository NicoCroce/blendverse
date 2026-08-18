---
task_id: 'TASK-003-daily-admin-report-20260805-1'
agent: 'Back_Agent'
status: 'IMPLEMENTED'
attempts: 1
date: '2026-08-06'
affected_files:
  - 'packages/server/src/domains/DailyReport/Domain/DailyReport.entity.ts'
  - 'packages/server/src/domains/DailyReport/Domain/DailyReport.types.ts'
  - 'packages/server/src/domains/DailyReport/Domain/DailyReportEmailSender.port.ts'
  - 'packages/server/src/domains/DailyReport/Application/DailyReport.service.ts'
  - 'packages/server/src/domains/DailyReport/Application/dailyReport.types.ts'
  - 'packages/server/src/domains/DailyReport/Application/UseCases/GenerateDailyReport.usecase.ts'
  - 'packages/server/src/domains/DailyReport/Application/UseCases/GenerateDailyReportStub.usecase.ts'
  - 'packages/server/src/domains/DailyReport/Application/UseCases/GetStatisticalSummary.usecase.ts'
  - 'packages/server/src/domains/DailyReport/Application/UseCases/SendReportEmail.usecase.ts'
  - 'packages/server/src/domains/DailyReport/Infrastructure/Controllers/DailyReport.controller.ts'
  - 'packages/server/src/domains/DailyReport/Infrastructure/Email/DailyReportEmailSender.implementation.ts'
  - 'packages/server/src/domains/DailyReport/Infrastructure/Scheduler/DailyReport.scheduler.ts'
  - 'packages/server/src/domains/Users/Domain/User.repository.ts'
  - 'packages/server/src/domains/Users/Infrastructure/Database/UsersRepository.implementation.ts'
  - 'packages/server/src/domains/Users/Application/UseCases/GetAllActiveOwners.usecase.ts'
  - 'packages/server/src/domains/Users/Application/UseCases/CountActiveEmployees.usecase.ts'
  - 'packages/server/src/domains/Certificates/Domain/Certificate.respository.ts'
  - 'packages/server/src/domains/Certificates/Infrastructure/Databases/CertificatesRepository.implementation.ts'
  - 'packages/server/src/domains/Certificates/Application/UseCases/GetEmployeesOnLeaveToday.usecase.ts'
  - 'packages/server/src/domains/Certificates/Application/UseCases/GetPendingLicenses.usecase.ts'
  - 'packages/server/src/domains/Certificates/Application/UseCases/GetUpcomingVacations.usecase.ts'
  - 'packages/server/src/domains/Certificates/Application/UseCases/GetExpiringLicenses.usecase.ts'
  - 'packages/server/src/domains/Certificates/Application/UseCases/CountLicensesInProgress.usecase.ts'
  - 'packages/server/src/domains/Certificates/Application/UseCases/CountPendingLicenses.usecase.ts'
  - 'packages/server/src/domains/Documents/Domain/Document.repository.ts'
  - 'packages/server/src/domains/Documents/Infrastructure/Database/DocumentsRepository.implementation.ts'
  - 'packages/server/src/domains/Documents/Application/UseCases/GetUnsignedDocuments.usecase.ts'
  - 'packages/server/src/domains/Documents/Application/UseCases/CountUnsignedDocuments.usecase.ts'
  - 'packages/server/src/domains/Disclaimer/Domain/Disclaimer.repository.ts'
  - 'packages/server/src/domains/Disclaimer/Infrastructure/Database/DisclaimerRepository.implementation.ts'
  - 'packages/server/src/domains/Disclaimer/Application/UseCases/GetPendingDisclaimerAcceptances.usecase.ts'
  - 'packages/server/src/domains/Disclaimer/Application/UseCases/CountPendingDisclaimers.usecase.ts'
  - 'packages/server/src/Infrastructure/utils/Email/EmailsTemplates.ts'
---

# Log de Desarrollo — Reporte Diario para Admins (daily-admin-report)

## Archivos Creados

| Archivo                                                                                                 | Capa           | Motivo                                                                   |
| ------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------ |
| `packages/server/src/domains/DailyReport/Domain/DailyReport.entity.ts`                                  | Domain         | Entidad de dominio del reporte diario (create/toJSON/values)             |
| `packages/server/src/domains/DailyReport/Domain/DailyReport.types.ts`                                   | Domain         | Tipos de la entidad DailyReport (sections + items)                       |
| `packages/server/src/domains/DailyReport/Domain/DailyReportEmailSender.port.ts`                         | Domain         | Puerto hexagonal `IDailyReportEmailSender.send({to, subject, html})`     |
| `packages/server/src/domains/DailyReport/Application/dailyReport.types.ts`                              | Application    | Zod/types: `IGenerateDailyReportInput`, `ISendReportEmailInput`, outputs |
| `packages/server/src/domains/DailyReport/Application/DailyReport.service.ts`                            | Application    | Orquesta owners → GenerateDailyReport → SendReportEmail por owner        |
| `packages/server/src/domains/DailyReport/Application/UseCases/GenerateDailyReport.usecase.ts`           | Application    | Ejecuta 7 secciones en paralelo y ensambla el reporte (US8)              |
| `packages/server/src/domains/DailyReport/Application/UseCases/GenerateDailyReportStub.usecase.ts`       | Application    | Stub para pruebas manuales (US8 dev)                                     |
| `packages/server/src/domains/DailyReport/Application/UseCases/GetStatisticalSummary.usecase.ts`         | Application    | Resumen estadístico (6 counts) inyectando use cases cross-domain         |
| `packages/server/src/domains/DailyReport/Application/UseCases/SendReportEmail.usecase.ts`               | Application    | Resuelve admins (GetAdmins) y envía vía puerto email                     |
| `packages/server/src/domains/DailyReport/Infrastructure/Controllers/DailyReport.controller.ts`          | Infrastructure | tRPC mutation `generateManual` (solo para desarrollo)                    |
| `packages/server/src/domains/DailyReport/Infrastructure/Email/DailyReportEmailSender.implementation.ts` | Infrastructure | Adapter del puerto → `MailNotificationService.sendOne()`                 |
| `packages/server/src/domains/DailyReport/Infrastructure/Scheduler/DailyReport.scheduler.ts`             | Infrastructure | Cron `0 9 * * *` America/Argentina/Buenos_Aires (FR-001/FR-015)          |
| `packages/server/src/domains/DailyReport/dailyReport.di.ts`                                             | DI             | Registro Awilix del dominio DailyReport                                  |
| `packages/server/src/domains/DailyReport/index.ts`                                                      | Barrel         | Export público del dominio (Application, Domain, Routes, DI)             |

## Archivos Modificados

| Archivo                                                                                                                                                 | Cambio aplicado                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `packages/server/src/domains/register.ts`                                                                                                               | Registro del módulo Awilix `dailyReportApp`                              |
| `packages/server/src/Infrastructure/Routes/Router.ts`                                                                                                   | Montaje de `DailyReportRoutes()` en el router tRPC                       |
| `packages/server/src/index.ts`                                                                                                                          | `dailyReportScheduler().init()` dentro del IIFE de bootstrap             |
| `packages/server/package.json`                                                                                                                          | Dependencia `node-cron@4.6.0` + `@types/node-cron@3.0.11`                |
| `packages/server/src/Infrastructure/utils/Email/EmailsTemplates.ts`                                                                                     | Nuevo template `dailyReport()` con `renderSection` y footer GestDoc      |
| `docs/email-notifications.md`                                                                                                                           | Caso "6. Reporte diario a admins" + diagrama de arquitectura actualizado |
| `packages/server/src/domains/Users/Domain/User.repository.ts` + `Infrastructure/Database/UsersRepository.implementation.ts`                             | `ICompanyOwner`, `getAllActiveOwners`, `countActiveEmployees`            |
| `packages/server/src/domains/Users/Application/UseCases/{GetAllActiveOwners,CountActiveEmployees}.usecase.ts` + `users.di.ts`                           | Use cases cross-domain para DailyReport                                  |
| `packages/server/src/domains/Certificates/Domain/Certificate.respository.ts` + `Infrastructure/Databases/CertificatesRepository.implementation.ts`      | 6 métodos de records diarios + tipos                                     |
| `packages/server/src/domains/Certificates/Application/UseCases/*` (6 nuevos) + `certificates.di.ts`                                                     | Use cases de sección (licencias/vacaciones)                              |
| `packages/server/src/domains/Documents/Domain/Document.repository.ts` + `Infrastructure/Database/DocumentsRepository.implementation.ts`                 | `getUnsignedDocuments`, `countUnsignedDocuments`                         |
| `packages/server/src/domains/Documents/Application/UseCases/{GetUnsignedDocuments,CountUnsignedDocuments}.usecase.ts` + `documents.di.ts`               | Use cases de sección (documentos sin firmar)                             |
| `packages/server/src/domains/Disclaimer/Domain/Disclaimer.repository.ts` + `Infrastructure/Database/DisclaimerRepository.implementation.ts`             | `getEmployeesWithoutDisclaimerAcceptance`, `countPendingDisclaimers`     |
| `packages/server/src/domains/Disclaimer/Application/UseCases/{GetPendingDisclaimerAcceptances,CountPendingDisclaimers}.usecase.ts` + `disclaimer.di.ts` | Use cases de sección (disclaimers pendientes)                            |
| `packages/server/src/domains/Certificates/Application/UseCases/specs/{AddCertificate,DeleteCertificate,UpdateCertificateStatus}.usecase.spec.ts`        | Mocks ampliados a la interfaz `CertificateRepository` crecida (TS2740)   |
| `packages/server/src/domains/Documents/Application/UseCases/specs/SendDocumentToEmail.usecase.spec.ts`                                                  | Mock ampliado con `getUnsignedDocuments`/`countUnsignedDocuments`        |

## Decisiones Técnicas

- **Cross-domain obligatorio (skill `cross-domain-relations`):** Los use cases de un dominio NO inyectan repositorios de otros dominios. Los 7 use cases de sección que inicialmente inyectaban repositorios de Certificates/Documents/Disclaimer/Users fueron **eliminados** de DailyReport y reemplazados por use cases nuevos en los dominios dueños de los datos. DailyReport inyecta esos use cases vía DI y los invoca con `executeUseCase`.
- **`GetStatisticalSummary` inyecta 5 use cases de count** (`CountActiveEmployees` de Users, `CountLicensesInProgress`/`CountPendingLicenses` de Certificates, `CountUnsignedDocuments` de Documents, `CountPendingDisclaimers` de Disclaimer) en lugar de duplicar queries. Solo genera el JSON de resumen con las 5 métricas + totales de la sección.
- **`getAllActiveOwners` sin filtro `active`:** `sis_propietarios` NO tiene columna `active` (verificado contra INFORMATION_SCHEMA). Se implementó devolviendo todos los owners con comentario explicando la discrepancia con el nombre del método. Si en el futuro se agrega la columna, agregar el filtro.
- **Patrón puerto/adaptador para email:** La capa Application depende de `IDailyReportEmailSender` (puerto en Domain). La implementación concreta usa `MailNotificationService.sendOne()` (Nodemailer) — `EmailSender.ts` es código muerto, no se usó.
- **Destinatarios vía `GetAdmins` de Permissions:** existente (`permissionsApp._getAdmins`), devuelve `string[]` de emails filtrando por `id_propietario`. Se reutilizó en lugar de crear una query nueva.
- **Contexto sintético en el service:** por cada owner se crea `new RequestContext(0, 'daily-report-${owner.id}-${Date.now()}', owner.id)`; try/catch por owner para que un fallo en una empresa no bloquee las demás (FR-012), con logging por `ownerId` (FR-013).
- **Fecha del reporte:** `todayISO()` (ISO local del servidor, `YYYY-MM-DD`) generado en `GenerateDailyReport`, no en la entidad, para mantener la entidad pura.
- **Scheduler:** node-cron con `0 9 * * *` y timezone explícito `America/Argentina/Buenos_Aires` (FR-001). Se inició solo si no está en test (`process.env.NODE_ENV !== 'test'` no aplica — se protege con import dinámico en `src/index.ts`).
- **Docs:** se actualizó `docs/email-notifications.md` (definition of done del skill `email-notifications`).
- **Tipos:** `IGenerateDailyReportInput`/`ISendReportEmailInput` en `dailyReport.types.ts`; la interfaz `IUseCase<TOutput, TInput>` actual usa `requestContext: RequestContext` (tipo concreto).

## Deuda Técnica Conocida

- `getAllActiveOwners` no filtra por `active` (columna inexistente en `sis_propietarios`); pendiente de decisión de negocio sobre qué propietarios reciben el reporte.
- `countPendingDisclaimers`/`countPendingLicenses`/`countUnsignedDocuments` usan counts sobre joins; si el volumen crece, convendría revisar índices en `disclaimer_firmas`, `certificados` y `documentos`.
- Los 6 archivos de specs de controllers que fallan con `TRPCError: Token error` (Auth, Permissions, Ownersyss, Themes, Users) y `ValidateUserPassword.usecase.test.ts` (mock de bcrypt roto) son **pre-existentes** y ajenos a esta tarea; no se tocaron.
