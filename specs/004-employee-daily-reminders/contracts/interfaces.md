# Contracts: Employee Daily Reminders

**Feature**: `004-employee-daily-reminders` | **Date**: 2026-08-06

## Overview

Define las interfaces de los casos de uso, el servicio, el scheduler, el controller, los puertos de email y los nuevos métodos de repositorio de la feature. Los casos de uso del dominio `EmployeeReminders` orquestan casos de uso de dominios existentes (`Documents`, `Disclaimer`, `Users`) vía inyección de dependencias (patrón `cross-domain-relations`). Sin cambios de data-model.

---

## Dominio NUEVO: `EmployeeReminders`

### 1. GenerateDailyReminder (orquestador por owner)

Genera los recordatorios de pendientes de todos los empleados de una empresa.

```typescript
// Application/UseCases/GenerateDailyReminder.usecase.ts
export interface IGenerateDailyReminderInput {
  companyName: string;
}
export interface IGenerateDailyReminderOutput {
  reminders: IEmployeeReminder[];
}

export class GenerateDailyReminder implements IUseCase<
  IGenerateDailyReminderOutput,
  IGenerateDailyReminderInput
> {
  constructor(
    private readonly _getEmployeesByCompany: GetEmployeesByCompany, // Disclaimer
    private readonly _getPendingDocumentsByEmployee: GetPendingDocumentsByEmployee, // Documents
  ) {}

  async execute({ input, requestContext }: /* IGenerateDailyReminder */): Promise<IGenerateDailyReminderOutput> {
    const ownerId = requestContext.values.ownerId;
    // 1. empleados = await _getEmployeesByCompany.execute({ requestContext, input: { ownerId } })
    // 2. por empleado: docs = await _getPendingDocumentsByEmployee.execute({ employeeId, requestContext })
    //    pending = { unsignedDocuments, unviewedDocuments, pendingDisclaimerAcceptance: estado_firma!=='Firmado', renewPassword: renovar_clave }
    // 3. shouldSend = any pending
    // 4. ensambla IEmployeeReminder[]
  }
}
```

**Dependencias (cross-domain)**: `_getEmployeesByCompany` (Disclaimer), `_getPendingDocumentsByEmployee` (Documents).

**Reglas**: `IEmployeeReminder` de `data-model.md`. `shouldSend` = hay al menos un pendiente (FR-008).

---

### 2. SendEmployeeReminderEmail (usa puerto + template)

```typescript
// Application/UseCases/SendEmployeeReminderEmail.usecase.ts
export interface ISendEmployeeReminderEmailInput {
  reminder: IEmployeeReminder;
}
export interface ISendEmployeeReminderEmailOutput {
  sent: boolean; // false si shouldSend=false o sin email válido
}

export class SendEmployeeReminderEmail implements IUseCase<
  ISendEmployeeReminderEmailOutput,
  ISendEmployeeReminderEmailInput
> {
  constructor(private readonly employeeEmailSender: IEmployeeEmailSender) {}

  async execute({
    input,
    requestContext,
  }: {
    input: ISendEmployeeReminderEmailInput;
    requestContext: IRequestContext;
  }): Promise<ISendEmployeeReminderEmailOutput> {
    const { reminder } = input;
    if (!reminder.shouldSend) return { sent: false };
    const { subject, body } = emailTemplates.employeeDailyReminder(reminder);
    await employeeEmailSender.send({
      to: [reminder.employeeEmail],
      subject,
      html: body,
    });
    return { sent: true };
  }
}
```

**Reglas**: envío solo con pendientes (FR-008); omisión sin email válido con log (FR-009).

---

### 3. NotifyNewDocument (notificación en tiempo real)

```typescript
// Application/UseCases/NotifyNewDocument.usecase.ts
export interface INotifyNewDocumentInput {
  ownerId: number;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  companyName: string;
  documents: Array<{ documentId: number; documentTitle: string }>; // ≥1
}
export interface INotifyNewDocumentOutput {
  notified: boolean;
}

export class NotifyNewDocument implements IUseCase<
  INotifyNewDocumentOutput,
  INotifyNewDocumentInput
> {
  constructor(private readonly employeeEmailSender: IEmployeeEmailSender) {}

  async execute(input): Promise<INotifyNewDocumentOutput> {
    // if (!employeeEmail válido) { logger.warn(...); return { notified: false }; }
    // const { subject, body } = emailTemplates.newDocumentNotification(input);
    // try { await employeeEmailSender.send(...); return { notified: true }; }
    // catch (error) { logger.error(...); return { notified: false }; }  // no relanza (FR-015)
  }
}
```

**Reglas**: un email agrupa todos los documentos del empleado en la operación (FR-013); sin email → log + skip (FR-014); fallo → log, no relanzar (FR-015).

---

### 4. EmployeeRemindersService (orquestador global + resiliencia)

```text
// Application/EmployeeReminders.service.ts
export class EmployeeRemindersService {
  constructor(
    private readonly _getAllActiveOwners: GetAllActiveOwners, // Users
    private readonly _generateDailyReminder: GenerateDailyReminder,
    private readonly _sendEmployeeReminderEmail: SendEmployeeReminderEmail,
  ) {}

  async sendDailyReminders({ requestContext }): Promise<{ sent; skipped; failed; totalOwners }> {
    const owners = await executeUseCase(_getAllActiveOwners);
    // por owner: RequestContext sintético (0, reqId, owner.id)
    //  reminders = _generateDailyReminder({ companyName: owner.denominacion })
    //  por reminder: _sendEmployeeReminderEmail → try/catch
    //  contadores; log errores con ownerId + employeeId (FR-009/FR-003)
  }
}
```

El patrón de `RequestContext` sintético por owner replica `DailyReportService.sendDailyReport` (003).

---

### 5. `EmployeeEmailSender` — puerto (Domain) + implementación (Infra)

```typescript
// Domain/EmployeeEmailSender.port.ts
export interface IEmployeeEmailSender {
  send(params: { to: string[]; subject: string; html: string }): Promise<void>;
}

// Infrastructure/Email/EmployeeEmailSender.implementation.ts
export class EmployeeEmailSenderImplementation implements IEmployeeEmailSender {
  constructor(
    private readonly mailNotificationService: MailNotificationService,
  ) {}
  async send(params) {
    await this.mailNotificationService.sendOne({
      ...params,
      html: params.html,
    });
  }
}
```

---

### 6. `EmployeeRemindersScheduler`

```typescript
// Infrastructure/Scheduler/EmployeeReminders.scheduler.ts
const CRON_EXPRESSION = '0 9 * * *';
const CRON_TIMEZONE = 'America/Argentina/Buenos_Aires';

export class EmployeeRemindersScheduler {
  constructor(
    private readonly employeeRemindersService: EmployeeRemindersService,
  ) {}
  init(): void; // cron.schedule(CRON_EXPRESSION, run, { timezone: CRON_TIMEZONE }); idempotente
  stop(): void;
}
```

---

### 7. `EmployeeRemindersController` (manual trigger, testing/debug)

```typescript
// Infrastructure/Controllers/EmployeeReminders.controller.ts
export class EmployeeRemindersController {
  constructor(private readonly employeeRemindersService: EmployeeRemindersService) {}
  sendDailyReminders = () =>
    protectedProcedure.mutation(
      executeService(this.employeeRemindersService.sendDailyReminders.bind(...)),
    );
}
```

---

### 8. DI — `employeeReminders.di.ts`

```typescript
export const employeeRemindersApp = {
  employeeRemindersService: asClass(EmployeeRemindersService),
  employeeRemindersController: asClass(EmployeeRemindersController),
  employeeRemindersScheduler: asClass(EmployeeRemindersScheduler),
  employeeEmailSender: asClass(EmployeeEmailSenderImplementation),
  _generateDailyReminder: asClass(GenerateDailyReminder),
  _sendEmployeeReminderEmail: asClass(SendEmployeeReminderEmail),
  _notifyNewDocument: asClass(NotifyNewDocument),
};
```

> No se re-registran `_getEmployeesByCompany` (Disclaimer), `_getAllActiveOwners` (Users) ni `_getPendingDocumentsByEmployee` (Documents): se resuelven desde sus dominios dueños — patrón `cross-domain-relations`.

---

## Dominio EXISTENTE: `Documents` (cambios)

### 9. `GetPendingDocumentsByEmployee` (nuevo)

```typescript
// Application/UseCases/GetPendingDocumentsByEmployee.usecase.ts
export interface IGetPendingDocumentsByEmployeeInput {
  employeeId: number;
}
export interface IPendingDocumentForEmployee {
  documentId: number;
  documentTitle: string;
  isUnsigned: boolean; // firmado IS NULL
  isUnviewed: boolean; // visualizado IS NULL
}
export class GetPendingDocumentsByEmployee implements IUseCase<
  IPendingDocumentForEmployee[]
> {
  constructor(private readonly documentsRepository: DocumentRepository) {}
  async execute({
    input,
    requestContext,
  }): Promise<IPendingDocumentForEmployee[]> {
    return this.documentsRepository.getPendingDocumentsByEmployee({
      employeeId: input.employeeId,
      requestContext,
    });
  }
}
```

**Clave DI (Documents)**: `_getPendingDocumentsByEmployee: asClass(GetPendingDocumentsByEmployee)`.

### 9.2 `IngestDocument` (nuevo — punto de ingreso + hook de notificación)

```typescript
// Application/UseCases/IngestDocument.usecase.ts
export interface IIngestDocumentItem {
  employeeId?: number; // opcional: si no viene, el doc no se asigna y no notifica (FR-014)
  tipo: number;
  titulo: string;
  archivo: string;
  extension?: string;
}
export interface IIngestDocumentInput {
  documents: IIngestDocumentItem[]; // pueden incluir varios para el mismo empleado
}
export interface IIngestDocumentOutput {
  documentIds: number[];
  notified: boolean;
}

export class IngestDocument implements IUseCase<
  IIngestDocumentOutput,
  IIngestDocumentInput
> {
  constructor(
    private readonly documentsRepository: DocumentRepository,
    private readonly _notifyNewDocument: NotifyNewDocument, // EmployeeReminders
  ) {}
  async execute({ input, requestContext }): Promise<IIngestDocumentOutput> {
    // 1. created = documentsRepository.createDocuments({ documents, requestContext }) // persistencia con fecha_de_subida=now
    // 2. agrupa los created que tienen employeeId ≠ null POR empleado
    // 3. por empleado: try { await _notifyNewDocument.execute({ ... }) } catch { logger.error(...) }  // no bloquea (FR-015)
    // 4. return { notified }
  }
}
```

**Clave DI (Documents)**: `_ingestDocument: asClass(IngestDocument)`.

> Nota DI: `IngestDocument` inyecta `_notifyNewDocument` (EmployeeReminders). En Awilix, "InjectionMode.CLASSIC" resuelve por nombre de parámetro y el registro es flat (merge en `register.ts`): la clave `_notifyNewDocument` se resuelve desde `employeeReminders.di.ts`. Sin repos de otros dominios (Pr. VII).

---

## Repository Interfaces (nuevos métodos)

### DocumentosRepository (Documents)

```typescript
// domains/Documents/Domain/Document.repository.ts (agrega)
export interface IPendingDocumentForEmployee {
  documentId: number;
  documentTitle: string;
  isUnsigned: boolean;
  isUnviewed: boolean;
}
export interface IDocumentToCreate {
  employeeId?: number;
  tipo: number;
  titulo: string;
  archivo: string;
  extension?: string;
}

getPendingDocumentsByEmployee(params: {
  employeeId: number;
  requestContext: IRequestContext['requestContext'];
}): Promise<IPendingDocumentForEmployee[]>;

createDocuments(params: {
  documents: IDocumentToCreate[];
  requestContext: IRequestContext['requestContext'];
}): Promise<Array<{ id: number; employeeId?: number; titulo: string }>>;
```

Implementación en `DocumentsRepository.implementation.ts`: `getPendingDocumentsByEmployee` consulta `Documentos.findAll({ where: { Usuario_id: employeeId, [Op.or]: [{ firmado: null }, { visualizado: null }] }, include: [{ model: UserModel, required: true, where: { id_propietario: ownerId } }] })` y mapea flags. `createDocuments` hace `bulkCreate` de `Documentos` con `fecha_de_subida = new Date()`.

---

## 11. Templates de email (nuevos)

```text
// Infrastructure/utils/Email/Templates/employeeDailyReminder.template.ts
emailTemplates.employeeDailyReminder(args: IEmployeeDailyReminder): { subject, body }
// subject: `[GestDoc] Tus pendientes — {companyName} — {date}`
// body: saludo con {employeeName} + solo secciones con pendientes (reusa renderSection/emailFooter)

// Infrastructure/utils/Email/Templates/newDocumentNotification.template.ts
emailTemplates.newDocumentNotification(args: { employeeName; companyName; documents }): { subject, body }
// subject: `[GestDoc] Tienes nuevos documentos por revisar`
// body: lista de {documents[].titulo}
```

Registrados en `Infrastructure/utils/Email/Templates/index.ts` → `emailTemplates`.

---

## 12. Rutas tRPC

### `DocumentRoutes` (Documents) — agrega `ingestDocument`

```text
documents.ingestDocument  → mutation, procedure protegido
  input: { documents: Array<{ employeeId?, tipo:number, titulo:string, archivo:string, extension?:string }> }
```

### `EmployeeRemindersRoutes` (nuevo)

```text
employeeReminders.sendDailyReminders → mutation, procedure protegido (manual trigger / testing, replica del 003)
```

---

## Summary

| Contrato                                 | Tipo       | Descripción                                                  |
| ---------------------------------------- | ---------- | ------------------------------------------------------------ |
| `GenerateDailyReminder`                  | Use Case   | Ensambla los pendientes por empleado (4 categorías)          |
| `SendEmployeeReminderEmail`              | Use Case   | Envía el email diario si `shouldSend`                        |
| `NotifyNewDocument`                      | Use Case   | Email real-time por evento de ingreso (agrupa multi-doc)     |
| `EmployeeRemindersService`               | Service    | owners→empleados, resiliencia multi-tenant                   |
| `EmployeeRemindersScheduler`             | Scheduler  | Cron `0 9 * * *` America/Argentina/Buenos_Aires              |
| `EmployeeRemindersController`            | Controller | Manual trigger por tRPC                                      |
| `GetPendingDocumentsByEmployee`          | Use Case   | Docs sin firmar / sin visualizar por empleado (Documents)    |
| `IngestDocument`                         | Use Case   | Punto de ingreso canónico + hook de notificación (Documents) |
| `IEmployeeEmailSender` + implementación  | Port       | Puertos hexagonal → `MailNotificationService.sendOne`        |
| `emailTemplates.employeeDailyReminder`   | Template   | Email diario de pendientes                                   |
| `emailTemplates.newDocumentNotification` | Template   | Email de documento nuevo (real-time)                         |
