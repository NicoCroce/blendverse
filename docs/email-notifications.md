# Emails en GestDoc

Documentación del sistema de envío de correos electrónicos.

---

## Infraestructura

El envío real de emails se realiza a través de **Nodemailer** usando el servicio `MailNotificationService`.

| Archivo                                                                                                    | Rol                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/server/src/Infrastructure/utils/Email/MailNotification.service.ts`                               | Servicio de envío SMTP con Nodemailer                                                                                                                                |
| `packages/server/src/Infrastructure/utils/Email/Config/smtp.config.ts`                                     | Configuración SMTP (env `EMAIL_*` + validación de variables críticas)                                                                                                |
| `packages/server/src/Infrastructure/utils/Email/Templates/index.ts`                                        | Barrel de templates + registro `emailTemplates`                                                                                                                      |
| `packages/server/src/Infrastructure/utils/Email/Templates/types.ts`                                        | Interfaces de argumentos de los templates                                                                                                                            |
| `packages/server/src/Infrastructure/utils/Email/Templates/shared.ts`                                       | Helpers compartidos (`renderSection`, `emailFooter`)                                                                                                                 |
| `packages/server/src/Infrastructure/utils/Email/Templates/*.template.ts`                                   | Un archivo por caso de mail (`addLicense`, `licenseStatusChange`, ...)                                                                                               |
| `packages/server/src/Application/Services/SendEmail.service.ts`                                            | Orquestador: resuelve destinatarios, construye payloads, invoca templates                                                                                            |
| `packages/server/src/domains/Disclaimer/Infrastructure/DisclaimerEmail.service.ts`                         | Envío de recordatorios de disclaimer (por fuera del orquestador central)                                                                                             |
| `packages/server/src/domains/EmployeeReminders/Infrastructure/Email/EmployeeEmailSender.implementation.ts` | Envío de recordatorios diarios de empleados y notificaciones de nuevos documentos (puerto hexagonal `IEmployeeEmailSender`, usa `MailNotificationService.sendOne()`) |

**Variables de entorno requeridas:**

| Variable             | Descripción                              |
| -------------------- | ---------------------------------------- |
| `EMAIL_SMTPSERVER`   | Host SMTP                                |
| `EMAIL_SMTPPORT`     | Puerto SMTP (default: 587)               |
| `EMAIL_SMTPUSER`     | Usuario SMTP (también usado como `from`) |
| `EMAIL_SMTPPASSWORD` | Contraseña SMTP                          |

Conexión: `secure: port === 465`, auth USER/PASS. Remitente (`from`) = `EMAIL_SMTPUSER`, sin overrides de from en ninguna llamada.

### Código muerto: `EmailSender.ts`

Existe `EmailSender.ts` (`packages/server/src/Infrastructure/utils/Email/EmailSender.ts`) que usa axios contra `EMAIL_HOST`, pero **nunca es importado** por ningún archivo del proyecto. Tiene hardcodeado `address: ['nicoc123@gmail.com']` y `subject: 'Gestdoc - Aviso de una nueva licencia'`. No está en uso en producción.

---

## Destinatarios clave: ¿quiénes son los "admins"?

Definidos en `PermissionsRepository.implementation.ts:184`:

```sql
-- Conceptual: usuarios con rol id_rol = 1 de la misma empresa
SELECT users.email
FROM users
JOIN users_roles ON users.id = users_roles.id_usuario
WHERE users_roles.id_rol = 1
  AND users.id_propietario = :ownerId
```

El rol `id_rol: 1` está **hardcodeado** en el repositorio (sin lookup por nombre). En el seed de datos, `id_rol: 1` corresponde a **Full Admin** / **Administrador**.

La función `getAdmins()` se usa en `SendEmailService` para resolver los destinatarios de mails dirigidos a administradores.

---

## Casos de email

### 1. Nueva licencia — `addLicense`

| Campo                           | Detalle                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------ |
| **Disparador**                  | Un empleado agrega una licencia a través de la app                             |
| **Origen en código**            | `Certificates.service.ts:112` → `SendEmail.service.ts:91`                      |
| **Destinatarios**               | **Todos los admins** de la empresa del empleado (rol `id_rol:1`, mismo owner)  |
| **Resolución de destinatarios** | `getAdmins()` → repository con filtro `id_rol: 1 AND id_propietario = ownerId` |
| **Asunto**                      | `[Aviso] Gestdoc - Nueva licencia de {nombre del empleado}`                    |
| **Cuerpo**                      | Contiene nombre del empleado y motivo de la licencia                           |
| **Template**                    | `Templates/addLicense.template.ts` — `addLicense()`                            |
| **Adjuntos**                    | No                                                                             |
| **Fire-and-forget**             | No (esperado con `await`)                                                      |

### 2. Estado de licencia aprobada/rechazada — `notifyLicenseStatusChange`

| Campo                           | Detalle                                                                                                                             |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Disparador**                  | Un admin cambia el estado de una licencia a `aprobado` o `rechazado`                                                                |
| **Origen en código**            | `Certificates.service.ts:211` → `SendEmail.service.ts:181`                                                                          |
| **Destinatarios**               | El **empleado dueño** de la licencia (`certificate.userId`)                                                                         |
| **Resolución de destinatarios** | `getUser(certificate.userId)` → `employee.values.mail`                                                                              |
| **Asunto**                      | `[GestDoc] Su licencia ha sido aprobada` / `[GestDoc] Su licencia ha sido rechazada`                                                |
| **Cuerpo**                      | Tabla con tipo, fechas de inicio/fin/reintegro, motivo, estado (con badge verde/rojo) e incluye nombre del revisor (`reviewerName`) |
| **Template**                    | `Templates/licenseStatusChange.template.ts` — `licenseStatusChange()`                                                               |
| **Adjuntos**                    | No                                                                                                                                  |
| **Fire-and-forget**             | Sí (`this.sendEmailService.notifyLicenseStatusChange(...)` sin await, línea 211)                                                    |

### 3. Firma de documento — `signDocument`

Se envían **dos mails** en una misma llamada.

| Campo                | Mail A — confirmación al empleado                                                                  | Mail B — notificación a admins                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Disparador**       | Empleado firma un documento                                                                        | Mismo disparador                                                                                |
| **Origen en código** | `Documents.service.ts:61` → `SendEmail.service.ts:131`                                             | Mismo                                                                                           |
| **Destinatarios**    | El **empleado que firmó** (`currentUser.mail`)                                                     | **Todos los admins** de la empresa                                                              |
| **Asunto**           | `[GestDoc] Has firmado el documento #{id}`                                                         | `[GestDoc] {empleado} ha firmado un documento`                                                  |
| **Cuerpo**           | ID del documento, tipo de firma (bajo acuerdo / sin conformidad), motivo si no conformidad         | Igual contenido que mail A pero dirigido a admins                                               |
| **Template**         | `Templates/documentSigned.template.ts` — `documentSignedEmployee()` (`documentSigned.template.ts`) | `Templates/documentSigned.template.ts` — `documentSignedAdmin()` (`documentSigned.template.ts`) |
| **Adjuntos**         | No                                                                                                 | No                                                                                              |
| **Fire-and-forget**  | Sí — `void this.sendEmailService.signDocument(...).catch(() => undefined)` (línea 60-68)           | Mismo                                                                                           |

### 4. Enviar documento por email — `sendDocumentToEmail`

| Campo                           | Detalle                                                                   |
| ------------------------------- | ------------------------------------------------------------------------- |
| **Disparador**                  | Acción "enviar por email" desde la UI de admin                            |
| **Origen en código**            | `Documents.service.ts:105` → `SendEmail.service.ts:102`                   |
| **Destinatarios**               | El **propio usuario logueado** que ejecuta la acción (`currentUser.mail`) |
| **Resolución de destinatarios** | `getCurrentUser(requestContext)` → `currentUser.values.mail`              |
| **Asunto**                      | `Documento: {título}`                                                     |
| **Cuerpo**                      | `Adjunto encontrará el documento {título} (ID: {id})`                     |
| **Template**                    | Inline en `SendEmail.service.ts:114` (HTML plano, no usa template)        |
| **Adjuntos**                    | Sí — PDF del documento descargado desde la URL (`document.values.file`)   |
| **Fire-and-forget**             | No (esperado con `await`)                                                 |

### 5. Recordatorio de firma de términos — `disclaimerReminder`

| Campo                           | Detalle                                                                                                                                                                                                                     |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Disparador**                  | Admin pulsa "enviar recordatorios" desde el panel de administración                                                                                                                                                         |
| **Origen en código**            | Frontend: `useSendReminders()` → tRPC → `Disclaimer.service.ts:73` → `SendReminders.usecase.ts` → `DisclaimerEmail.service.ts:14`                                                                                           |
| **Destinatarios**               | Empleados de la empresa **pendientes de firmar** los términos y condiciones                                                                                                                                                 |
| **Resolución de destinatarios** | `getPendingEmployeeIds()`: busca todos los usuarios del owner, cruza con `disclaimer_acceptance` filtrando los que no tienen firma válida. Luego `getEmailsByUsersId()` obtiene los emails, procesados en **batches de 50** |
| **Asunto**                      | `[GestDoc] Recordatorio de firma de términos - {empresa}`                                                                                                                                                                   |
| **Cuerpo**                      | Nombre del empleado, nombre de la empresa y texto completo de los términos                                                                                                                                                  |
| **Template**                    | `Templates/disclaimerReminder.template.ts` — `disclaimerReminder()`                                                                                                                                                         |
| **Adjuntos**                    | No                                                                                                                                                                                                                          |
| **Fire-and-forget**             | No. Resultado con métricas (`{sent, failed, total}`) devuelto al frontend                                                                                                                                                   |
| **Nota**                        | **No hay cron/scheduler.** El envío es exclusivamente manual desde la UI de admin                                                                                                                                           |

### 6. Reporte diario a admins — `dailyReport`

| Campo                           | Detalle                                                                                                                                                                                                                                                                                                     |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Disparador**                  | Cron diario a las **9:00 AM hora Argentina** (`0 9 * * *`, timezone `America/Argentina/Buenos_Aires`) o trigger manual (tRPC `dailyReport.generateManual`)                                                                                                                                                  |
| **Origen en código**            | `Infrastructure/Scheduler/DailyReport.scheduler.ts` → `DailyReport.service.ts` → `SendReportEmail.usecase.ts` → puerto `IDailyReportEmailSender` → `DailyReportEmailSender.implementation.ts` → `MailNotificationService.sendOne()`                                                                         |
| **Destinatarios**               | **Todos los admins** de la empresa (rol `id_rol:1`, mismo owner), resueltos con `GetAdmins` (dominio Permissions, cross-domain)                                                                                                                                                                             |
| **Alcance**                     | Un email por empresa activa. Se itera sobre `getAllActiveOwners()` (dominio Users). Un fallo en una empresa **no bloquea** el envío a las demás (FR-012); los errores se loguean con `ownerId` (FR-013)                                                                                                     |
| **Resolución de destinatarios** | `_getAdmins` → `PermissionsRepository.getAdmins()` (`id_rol: 1 AND id_propietario = ownerId`). Si una empresa no tiene admins, se loguea un warning y se omite el envío                                                                                                                                     |
| **Asunto**                      | `[GestDoc] Reporte diario — {empresa} — {fecha}`                                                                                                                                                                                                                                                            |
| **Cuerpo**                      | Resumen estadístico (empleados activos, licencias en curso/pendientes, documentos sin firmar, términos sin aceptar) + 6 secciones detalladas: empleados de licencia hoy, licencias pendientes, documentos sin firmar, términos sin aceptar, vacaciones próximas (15 días), licencias que vencen esta semana |
| **Template**                    | `Templates/dailyReport.template.ts` — `dailyReport()`                                                                                                                                                                                                                                                       |
| **Adjuntos**                    | No                                                                                                                                                                                                                                                                                                          |
| **Fire-and-forget**             | No. El cron espera el resultado y loguea métricas `{sent, failed, total}`                                                                                                                                                                                                                                   |
| **Nota**                        | El scheduler se inicializa en `packages/server/src/index.ts` después de `registerDI(app)` (`dailyReportScheduler().init()`). El email viaja por el puerto hexagonal `IDailyReportEmailSender` para no acoplar la capa Application a Nodemailer                                                              |

### 7. Recordatorio diario de pendientes — `employeeDailyReminder`

| Campo                           | Detalle                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Disparador**                  | Cron diario a las **9:00 AM hora Argentina** (`0 9 * * *`, timezone `America/Argentina/Buenos_Aires`) o trigger manual (tRPC `employeeReminders.sendDailyReminders`)                                                                                                                                                                                          |
| **Origen en código**            | `Infrastructure/Scheduler/EmployeeReminders.scheduler.ts` → `EmployeeReminders.service.ts` → `GenerateDailyReminder.usecase.ts` → `SendEmployeeReminderEmail.usecase.ts` → puerto `IEmployeeEmailSender` → `EmployeeEmailSender.implementation.ts` → `MailNotificationService.sendOne()`                                                                      |
| **Destinatarios**               | **Empleados individuales** de cada empresa activa que tienen pendientes (documentos sin firmar/sin visualizar, términos sin aceptar, renovación de clave)                                                                                                                                                                                                     |
| **Alcance**                     | Un email por empleado, agrupado por empresa activa (`getAllActiveOwners()`). Por empleado se resuelven sus pendientes con `_getEmployeesByCompany` (dominio Disclaimer, cross-domain) y `_getPendingDocumentsByEmployee` (dominio Documents, cross-domain). Un fallo en un empleado no bloquea el resto (FR-008); errores logueados por `employeeId` (FR-009) |
| **Resolución de destinatarios** | `_getEmployeesByCompany` (page `'1'`, limit `MAX_EMPLOYEES_LIMIT = '100000'`) → `IEmployeeRecord.email`. Emails inválidos (`isValidEmail`) se omiten con log. Si el empleado no tiene pendientes (`shouldSend === false`), se omite el envío (FR-010)                                                                                                         |
| **Asunto**                      | `[GestDoc] Tus pendientes — {empresa} — {fecha DD/MM/YYYY}`                                                                                                                                                                                                                                                                                                   |
| **Cuerpo**                      | Secciones: `Documentos sin firmar (N)`, `Documentos sin visualizar (N)`, `Términos y condiciones sin aceptar`, `Renovar contraseña`                                                                                                                                                                                                                           |
| **Template**                    | `Templates/employeeDailyReminder.template.ts` — `employeeDailyReminder()`                                                                                                                                                                                                                                                                                     |
| **Adjuntos**                    | No                                                                                                                                                                                                                                                                                                                                                            |
| **Fire-and-forget**             | No. El cron espera el resultado y loguea métricas `{sent, skipped, failed, totalOwners}`                                                                                                                                                                                                                                                                      |
| **Nota**                        | El scheduler se inicializa en `packages/server/src/index.ts` después de `registerDI(app)` (`employeeRemindersScheduler().init()`). Email viaja por el puerto hexagonal `IEmployeeEmailSender` para no acoplar la capa Application a Nodemailer                                                                                                                |

### 8. Nuevo documento por ingreso — `newDocumentNotification`

| Campo                           | Detalle                                                                                                                                                                                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Disparador**                  | Ingesta de documentos (tRPC `documents.ingestDocument`) con documentos asignados a empleados                                                                                                                                                   |
| **Origen en código**            | `IngestDocument.usecase.ts` (dominio Documents) → `NotifyNewDocument.usecase.ts` (dominio EmployeeReminders, cross-domain) → puerto `IEmployeeEmailSender` → `EmployeeEmailSender.implementation.ts` → `MailNotificationService.sendOne()`     |
| **Destinatarios**               | **Empleados destinatarios** de los documentos ingestados (se agrupa por empleado; varios documentos en una operación → UNA notificación)                                                                                                       |
| **Resolución de destinatarios** | `_getUser` (dominio Users) → `user.values.mail`; `companyName` desde `_getAllActiveOwners` (dominio Users)                                                                                                                                     |
| **Asunto**                      | `[GestDoc] Tienes nuevos documentos por revisar`                                                                                                                                                                                               |
| **Cuerpo**                      | Saludo al empleado + lista de documentos recientes con su título                                                                                                                                                                               |
| **Template**                    | `Templates/newDocumentNotification.template.ts` — `newDocumentNotification()`                                                                                                                                                                  |
| **Adjuntos**                    | No                                                                                                                                                                                                                                             |
| **Fire-and-forget**             | No. Un fallo de notificación o de resolución del empleado **no bloquea el ingreso** (FR-015): el documento queda persistido como pendiente y lo cubre el batch diario                                                                          |
| **Nota**                        | Documentos sin `employeeId` no se notifican (se omiten en el repositorio — `Usuario_id` es NOT NULL en la tabla `documentos`). `NotifyNewDocument` devuelve `{ notified: boolean }` que `IngestDocument` agrega en `{ documentIds, notified }` |

---

## Arquitectura

### Flujo de tipos de email

```
Capa Application                Capa Infrastructure
─────────────────────          ──────────────────────
SendEmail.service.ts    ──────> MailNotification.service.ts  (Nodemailer SMTP)
  ├─ addLicense                    ├─ sendOne()
  ├─ notifyLicenseStatusChange     └─ send()  (batch)
  ├─ signDocument                Templates/ (un archivo por caso)
  └─ sendDocumentToEmail           ├─ addLicense.template.ts
                                   ├─ licenseStatusChange.template.ts
DisclaimerEmail.service.ts ────>  ├─ documentSigned.template.ts
  └─ sendDisclaimerReminders()     ├─ disclaimerReminder.template.ts
                                   ├─ dailyReport.template.ts
DailyReport (puerto hexagonal)     ├─ employeeDailyReminder.template.ts
  SendReportEmail.usecase.ts       └─ newDocumentNotification.template.ts
  → IDailyReportEmailSender      shared.ts (renderSection, emailFooter)
  → DailyReportEmailSender.
      implementation.ts ─────────> MailNotificationService.sendOne()

EmployeeReminders (puerto hexagonal)
  GenerateDailyReminder / NotifyNewDocument / SendEmployeeReminderEmail
  → IEmployeeEmailSender
  → EmployeeEmailSender.
      implementation.ts ─────────> MailNotificationService.sendOne()
```

### Capa de orquestación (`SendEmailService`)

- Depende de `GetAdmins` y `GetUser` para resolver destinatarios.
- Método privado `sendEmailToAdmins<Targs>()` — patrón genérico: obtiene currentUser + admins, aplica template, envía con Nodemailer.
- `signDocument()` es el único caso que envía **dos mails** en una misma llamada (empleado + admins).

### Capa de infraestructura (`MailNotificationService`)

- Singleton Nodemailer transporter inicializado en constructor.
- `sendOne()`: envía un mail individual.
- `send()`: envía en lote con resiliencia parcial (no detiene el lote si un mail falla).
- `verifyConnection()`: disponible para health checks (no está integrado en ningún endpoint).

---

## Observaciones

1. **Rol hardcodeado.** `getAdmins()` usa `id_rol: 1` hardcodeado en `PermissionsRepository.implementation.ts:191`. Si el seed cambia o se recrea la DB, el ID podría no coincidir. Sería más robusto resolver por denominación (`'Full Admin'` o `'Administrador'`).

2. **Política de errores inconsistente.** `signDocument` y `notifyLicenseStatusChange` usan fire-and-forget (no `await`, `.catch(() => undefined)`), mientras que `addLicense`, `sendDocumentToEmail` y `disclaimerReminder` esperan el resultado con `await`. Los errores se loguean pero no se reintentan ni se notifican al usuario.

3. **Self-mail en `sendDocumentToEmail`.** Se envía al propio usuario logueado, no a un destinatario arbitrario. El nombre de la acción puede resultar confuso para quien lo implementa — en realidad "envía el PDF a mi propio email".

4. **Código muerto.** `EmailSender.ts` usa axios contra `EMAIL_HOST` con credenciales `EMAIL_TOKEN`/`EMAIL_CUIT`. Fue reemplazado por Nodemailer (`MailNotificationService`) pero quedó en el barrel de exports. Contiene un hardcodeo de `nicoc123@gmail.com`.

5. **Sin cron para recordatorios.** Los recordatorios de disclaimer son disparados exclusivamente por un admin desde la UI. No hay tarea programada. Esto implica que la funcionalidad depende de intervención humana periódica.
