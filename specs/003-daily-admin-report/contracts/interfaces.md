# Contracts: Daily Admin Report

**Feature**: `003-daily-admin-report` | **Date**: 2026-08-05

## Overview

Este documento define las interfaces de los casos de uso y servicios del dominio `DailyReport`. Estas interfaces son el contrato entre las capas del dominio y la infraestructura.

---

## Use Cases

### GetEmployeesOnLeaveToday

Obtiene los empleados que están de licencia hoy (licencias aprobadas donde `startDate <= hoy <= endDate`).

```typescript
// Application/UseCases/GetEmployeesOnLeaveToday.usecase.ts

import { IUseCase, IRequestContext } from '@server/Application';
import { EmployeesOnLeaveTodaySection } from '../dailyReport.types';

export interface IGetEmployeesOnLeaveTodayInput {
  // No input adicional, solo requestContext
}

export interface IGetEmployeesOnLeaveTodayOutput {
  section: EmployeesOnLeaveTodaySection;
}

export class GetEmployeesOnLeaveToday implements IUseCase<
  IGetEmployeesOnLeaveTodayOutput,
  IGetEmployeesOnLeaveTodayInput
> {
  constructor(private readonly certificateRepository: CertificateRepository) {}

  async execute({
    requestContext,
  }: {
    requestContext: IRequestContext['requestContext'];
  }): Promise<IGetEmployeesOnLeaveTodayOutput> {
    // Implementación
  }
}
```

**Dependencias**:

- `CertificateRepository.getEmployeesOnLeaveToday()` (nuevo método).

---

### GetPendingLicenses

Obtiene las licencias pendientes de aprobación (status = 'pendiente').

```typescript
// Application/UseCases/GetPendingLicenses.usecase.ts

import { IUseCase, IRequestContext } from '@server/Application';
import { PendingLicensesSection } from '../dailyReport.types';

export interface IGetPendingLicensesInput {
  // No input adicional
}

export interface IGetPendingLicensesOutput {
  section: PendingLicensesSection;
}

export class GetPendingLicenses implements IUseCase<
  IGetPendingLicensesOutput,
  IGetPendingLicensesInput
> {
  constructor(private readonly certificateRepository: CertificateRepository) {}

  async execute({
    requestContext,
  }: {
    requestContext: IRequestContext['requestContext'];
  }): Promise<IGetPendingLicensesOutput> {
    // Implementación
  }
}
```

**Dependencias**:

- `CertificateRepository.getPendingLicenses()` (nuevo método).

---

### GetUnsignedDocuments

Obtiene los documentos que requieren firma pero no fueron firmados (`requireSign = true`, `signed = null`).

```typescript
// Application/UseCases/GetUnsignedDocuments.usecase.ts

import { IUseCase, IRequestContext } from '@server/Application';
import { UnsignedDocumentsSection } from '../dailyReport.types';

export interface IGetUnsignedDocumentsInput {
  // No input adicional
}

export interface IGetUnsignedDocumentsOutput {
  section: UnsignedDocumentsSection;
}

export class GetUnsignedDocuments implements IUseCase<
  IGetUnsignedDocumentsOutput,
  IGetUnsignedDocumentsInput
> {
  constructor(private readonly documentRepository: DocumentRepository) {}

  async execute({
    requestContext,
  }: {
    requestContext: IRequestContext['requestContext'];
  }): Promise<IGetUnsignedDocumentsOutput> {
    // Implementación
  }
}
```

**Dependencias**:

- `DocumentRepository.getUnsignedDocuments()` (nuevo método).

---

### GetPendingDisclaimerAcceptances

Obtiene los empleados activos que no tienen registro en `DisclaimerAcceptance` para su empresa.

```typescript
// Application/UseCases/GetPendingDisclaimerAcceptances.usecase.ts

import { IUseCase, IRequestContext } from '@server/Application';
import { PendingDisclaimerAcceptancesSection } from '../dailyReport.types';

export interface IGetPendingDisclaimerAcceptancesInput {
  // No input adicional
}

export interface IGetPendingDisclaimerAcceptancesOutput {
  section: PendingDisclaimerAcceptancesSection;
}

export class GetPendingDisclaimerAcceptances implements IUseCase<
  IGetPendingDisclaimerAcceptancesOutput,
  IGetPendingDisclaimerAcceptancesInput
> {
  constructor(private readonly disclaimerRepository: DisclaimerRepository) {}

  async execute({
    requestContext,
  }: {
    requestContext: IRequestContext['requestContext'];
  }): Promise<IGetPendingDisclaimerAcceptancesOutput> {
    // Implementación
  }
}
```

**Dependencias**:

- `DisclaimerRepository.getEmployeesWithoutDisclaimerAcceptance()` (nuevo método).

---

### GetUpcomingVacations

Obtiene las vacaciones aprobadas con `startDate` dentro de los próximos 15 días.

```typescript
// Application/UseCases/GetUpcomingVacations.usecase.ts

import { IUseCase, IRequestContext } from '@server/Application';
import { UpcomingVacationsSection } from '../dailyReport.types';

export interface IGetUpcomingVacationsInput {
  // No input adicional
}

export interface IGetUpcomingVacationsOutput {
  section: UpcomingVacationsSection;
}

export class GetUpcomingVacations implements IUseCase<
  IGetUpcomingVacationsOutput,
  IGetUpcomingVacationsInput
> {
  constructor(private readonly certificateRepository: CertificateRepository) {}

  async execute({
    requestContext,
  }: {
    requestContext: IRequestContext['requestContext'];
  }): Promise<IGetUpcomingVacationsOutput> {
    // Implementación
  }
}
```

**Dependencias**:

- `CertificateRepository.getUpcomingVacations()` (nuevo método).

---

### GetExpiringLicenses

Obtiene las licencias aprobadas cuyo `endDate` está dentro de los próximos 7 días.

```typescript
// Application/UseCases/GetExpiringLicenses.usecase.ts

import { IUseCase, IRequestContext } from '@server/Application';
import { ExpiringLicensesSection } from '../dailyReport.types';

export interface IGetExpiringLicensesInput {
  // No input adicional
}

export interface IGetExpiringLicensesOutput {
  section: ExpiringLicensesSection;
}

export class GetExpiringLicenses implements IUseCase<
  IGetExpiringLicensesOutput,
  IGetExpiringLicensesInput
> {
  constructor(private readonly certificateRepository: CertificateRepository) {}

  async execute({
    requestContext,
  }: {
    requestContext: IRequestContext['requestContext'];
  }): Promise<IGetExpiringLicensesOutput> {
    // Implementación
  }
}
```

**Dependencias**:

- `CertificateRepository.getExpiringLicenses()` (nuevo método).

---

### GetStatisticalSummary

Obtiene el resumen estadístico con totales clave.

```typescript
// Application/UseCases/GetStatisticalSummary.usecase.ts

import { IUseCase, IRequestContext } from '@server/Application';
import { StatisticalSummarySection } from '../dailyReport.types';

export interface IGetStatisticalSummaryInput {
  // No input adicional
}

export interface IGetStatisticalSummaryOutput {
  section: StatisticalSummarySection;
}

export class GetStatisticalSummary implements IUseCase<
  IGetStatisticalSummaryOutput,
  IGetStatisticalSummaryInput
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly certificateRepository: CertificateRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly disclaimerRepository: DisclaimerRepository,
  ) {}

  async execute({
    requestContext,
  }: {
    requestContext: IRequestContext['requestContext'];
  }): Promise<IGetStatisticalSummaryOutput> {
    // Implementación
  }
}
```

**Dependencias**:

- `UserRepository.countActiveEmployees()` (nuevo método).
- `CertificateRepository.countLicensesInProgress()` (nuevo método).
- `CertificateRepository.countPendingLicenses()` (nuevo método).
- `DocumentRepository.countUnsignedDocuments()` (nuevo método).
- `DisclaimerRepository.countPendingDisclaimers()` (nuevo método).

---

### GenerateDailyReport (orquestador)

Orquesta todos los casos de uso de secciones para generar el reporte completo.

```typescript
// Application/UseCases/GenerateDailyReport.usecase.ts

import { IUseCase, IRequestContext } from '@server/Application';
import { DailyReport } from '../../Domain/DailyReport.entity';

export interface IGenerateDailyReportInput {
  // No input adicional
}

export interface IGenerateDailyReportOutput {
  report: DailyReport;
}

export class GenerateDailyReport implements IUseCase<
  IGenerateDailyReportOutput,
  IGenerateDailyReportInput
> {
  constructor(
    private readonly _getEmployeesOnLeaveToday: GetEmployeesOnLeaveToday,
    private readonly _getPendingLicenses: GetPendingLicenses,
    private readonly _getUnsignedDocuments: GetUnsignedDocuments,
    private readonly _getPendingDisclaimerAcceptances: GetPendingDisclaimerAcceptances,
    private readonly _getUpcomingVacations: GetUpcomingVacations,
    private readonly _getExpiringLicenses: GetExpiringLicenses,
    private readonly _getStatisticalSummary: GetStatisticalSummary,
  ) {}

  async execute({
    requestContext,
  }: {
    requestContext: IRequestContext['requestContext'];
  }): Promise<IGenerateDailyReportOutput> {
    // Ejecutar todos los use cases en paralelo
    const [
      employeesOnLeave,
      pendingLicenses,
      unsignedDocuments,
      pendingDisclaimers,
      upcomingVacations,
      expiringLicenses,
      statisticalSummary,
    ] = await Promise.all([
      this._getEmployeesOnLeaveToday.execute({ requestContext }),
      this._getPendingLicenses.execute({ requestContext }),
      this._getUnsignedDocuments.execute({ requestContext }),
      this._getPendingDisclaimerAcceptances.execute({ requestContext }),
      this._getUpcomingVacations.execute({ requestContext }),
      this._getExpiringLicenses.execute({ requestContext }),
      this._getStatisticalSummary.execute({ requestContext }),
    ]);

    const report = DailyReport.create({
      ownerId: requestContext.values.ownerId,
      companyName: '', // Se obtiene del OwnersyssRepository
      date: new Date().toISOString().split('T')[0],
      sections: {
        employeesOnLeaveToday: employeesOnLeave.section,
        pendingLicenses: pendingLicenses.section,
        unsignedDocuments: unsignedDocuments.section,
        pendingDisclaimerAcceptances: pendingDisclaimers.section,
        upcomingVacations: upcomingVacations.section,
        expiringLicenses: expiringLicenses.section,
        statisticalSummary: statisticalSummary.section,
      },
    });

    return { report };
  }
}
```

**Dependencias**: Todos los use cases de secciones.

---

### GetAllActiveOwners

Obtiene todos los `id_propietario` distintos (empresas activas).

```typescript
// Application/UseCases/GetAllActiveOwners.usecase.ts

import { IUseCase, IRequestContext } from '@server/Application';

export interface IGetAllActiveOwnersInput {
  // No input adicional
}

export interface IGetAllActiveOwnersOutput {
  owners: Array<{ id: number; denominacion: string }>;
}

export class GetAllActiveOwners implements IUseCase<
  IGetAllActiveOwnersOutput,
  IGetAllActiveOwnersInput
> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({
    requestContext,
  }: {
    requestContext: IRequestContext['requestContext'];
  }): Promise<IGetAllActiveOwnersOutput> {
    // Implementación
  }
}
```

**Dependencias**:

- `UserRepository.getAllActiveOwners()` (nuevo método).

---

## Services

### DailyReportService

Orquesta la generación y envío del reporte diario para todas las empresas.

```typescript
// Application/DailyReport.service.ts

import { IRequestContext } from '@server/Application';

export interface ISendDailyReportInput {
  // No input adicional (el servicio itera sobre todos los owners)
}

export interface ISendDailyReportOutput {
  sent: number;
  failed: number;
  total: number;
}

export class DailyReportService {
  constructor(
    private readonly _getAllActiveOwners: GetAllActiveOwners,
    private readonly _generateDailyReport: GenerateDailyReport,
    private readonly _sendReportEmail: SendReportEmail,
  ) {}

  async sendDailyReport({
    requestContext,
  }: {
    requestContext: IRequestContext['requestContext'];
  }): Promise<ISendDailyReportOutput> {
    const owners = await this._getAllActiveOwners.execute({ requestContext });

    let sent = 0;
    let failed = 0;

    for (const owner of owners.owners) {
      try {
        // Crear un RequestContext sintético para este owner
        const ownerContext = RequestContext.create(owner.id);

        // Generar el reporte
        const { report } = await this._generateDailyReport.execute({
          requestContext: ownerContext,
        });

        // Enviar el email
        await this._sendReportEmail.execute({
          report,
          requestContext: ownerContext,
        });

        sent++;
      } catch (error) {
        failed++;
        logger.error(
          { ownerId: owner.id, error },
          'Failed to generate/send daily report',
        );
        // Continuar con el siguiente owner (FR-012)
      }
    }

    return { sent, failed, total: owners.owners.length };
  }
}
```

**Dependencias**:

- `GetAllActiveOwners`
- `GenerateDailyReport`
- `SendReportEmail`

---

### SendReportEmail

Envía el email del reporte a los administradores de la empresa.

**Nota de arquitectura**: Este use case NO depende directamente de `MailNotificationService` (infraestructura). En su lugar, usa el puerto `DailyReportEmailSender` definido en Domain, que se implementa en Infrastructure. Esto cumple con el principio de arquitectura hexagonal.

```typescript
// Application/UseCases/SendReportEmail.usecase.ts

import { IUseCase, IRequestContext } from '@server/Application';
import { DailyReport } from '../../Domain/DailyReport.entity';
import { DailyReportEmailSender } from '../../Domain/DailyReportEmailSender.port';
import { GetAdmins } from '@server/domains/Permissions/Application';

export interface ISendReportEmailInput {
  report: DailyReport;
}

export interface ISendReportEmailOutput {
  success: boolean;
}

export class SendReportEmail implements IUseCase<
  ISendReportEmailOutput,
  ISendReportEmailInput
> {
  constructor(
    private readonly _getAdmins: GetAdmins,
    private readonly _emailSender: DailyReportEmailSender,
  ) {}

  async execute({
    input,
    requestContext,
  }: {
    input: ISendReportEmailInput;
    requestContext: IRequestContext['requestContext'];
  }): Promise<ISendReportEmailOutput> {
    const admins = await this._getAdmins.execute({ requestContext });

    if (!admins || admins.length === 0) {
      logger.warn(
        { ownerId: requestContext.values.ownerId },
        'No admins found for owner, skipping email',
      );
      return { success: false };
    }

    const { subject, body } = emailTemplates.dailyReport(input.report);

    await this._emailSender.send({
      to: admins,
      subject,
      html: body,
    });

    return { success: true };
  }
}
```

**Dependencias**:

- `GetAdmins` (de Permissions).
- `DailyReportEmailSender` (puerto en Domain, implementado en Infrastructure).

---

## Ports (Domain → Infrastructure)

### DailyReportEmailSender

Puerto para el envío de emails del reporte. Define la interfaz en Domain, la implementación vive en Infrastructure usando `MailNotificationService`.

```typescript
// Domain/DailyReportEmailSender.port.ts

export interface IDailyReportEmailSender {
  send(params: { to: string[]; subject: string; html: string }): Promise<void>;
}
```

```typescript
// Infrastructure/Email/DailyReportEmailSender.implementation.ts

import { IDailyReportEmailSender } from '../../Domain/DailyReportEmailSender.port';
import { MailNotificationService } from '@server/Infrastructure';

export class DailyReportEmailSenderImplementation implements IDailyReportEmailSender {
  constructor(
    private readonly mailNotificationService: MailNotificationService,
  ) {}

  async send(params: {
    to: string[];
    subject: string;
    html: string;
  }): Promise<void> {
    await this.mailNotificationService.sendOne({
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  }
}
```

**Rationale**: Este patrón puerto/adapter cumple con el principio de arquitectura hexagonal. Los use cases dependen de abstracciones (puertos), no de implementaciones concretas (infraestructura).

---

## Repository Interfaces (nuevos métodos)

### CertificateRepository

```typescript
// domains/Certificates/Domain/Certificate.repository.ts

export interface CertificateRepository {
  // Métodos existentes...

  // Nuevos métodos para DailyReport
  getEmployeesOnLeaveToday(
    params: IRequestContext,
  ): Promise<EmployeeOnLeaveItem[]>;
  getPendingLicenses(params: IRequestContext): Promise<PendingLicenseItem[]>;
  getUpcomingVacations(
    params: IRequestContext,
  ): Promise<UpcomingVacationItem[]>;
  getExpiringLicenses(params: IRequestContext): Promise<ExpiringLicenseItem[]>;
  countLicensesInProgress(params: IRequestContext): Promise<number>;
  countPendingLicenses(params: IRequestContext): Promise<number>;
}
```

### DocumentRepository

```typescript
// domains/Documents/Domain/Document.repository.ts

export interface DocumentRepository {
  // Métodos existentes...

  // Nuevos métodos para DailyReport
  getUnsignedDocuments(
    params: IRequestContext,
  ): Promise<UnsignedDocumentItem[]>;
  countUnsignedDocuments(params: IRequestContext): Promise<number>;
}
```

### DisclaimerRepository

```typescript
// domains/Disclaimer/Domain/Disclaimer.repository.ts

export interface DisclaimerRepository {
  // Métodos existentes...

  // Nuevos métodos para DailyReport
  getEmployeesWithoutDisclaimerAcceptance(
    params: IRequestContext,
  ): Promise<PendingDisclaimerAcceptanceItem[]>;
  countPendingDisclaimers(params: IRequestContext): Promise<number>;
}
```

### UserRepository

```typescript
// domains/Users/Domain/User.repository.ts

export interface UserRepository {
  // Métodos existentes...

  // Nuevos métodos para DailyReport
  getAllActiveOwners(): Promise<Array<{ id: number; denominacion: string }>>;
  countActiveEmployees(params: IRequestContext): Promise<number>;
}
```

---

## Scheduler Interface

### DailyReportScheduler

```typescript
// Infrastructure/Scheduler/DailyReport.scheduler.ts

export class DailyReportScheduler {
  private task: cron.ScheduledTask | null = null;

  constructor(private readonly dailyReportService: DailyReportService) {}

  init(): void {
    // Configurar el cron job para las 9:00 AM hora Argentina
    this.task = cron.schedule(
      '0 9 * * *',
      async () => {
        logger.info('Starting daily report job');

        try {
          const systemContext = RequestContext.createSystem();
          const result = await this.dailyReportService.sendDailyReport({
            requestContext: systemContext,
          });

          logger.info(
            { sent: result.sent, failed: result.failed, total: result.total },
            'Daily report job completed',
          );
        } catch (error) {
          logger.error(error, 'Daily report job failed');
        }
      },
      {
        timezone: 'America/Argentina/Buenos_Aires',
      },
    );

    logger.info(
      'Daily report scheduler initialized (9:00 AM America/Argentina/Buenos_Aires)',
    );
  }

  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      logger.info('Daily report scheduler stopped');
    }
  }
}
```

**Dependencias**:

- `DailyReportService`

---

## Controller Interface

### DailyReportController

```typescript
// Infrastructure/Controllers/DailyReport.controller.ts

export class DailyReportController {
  constructor(private readonly dailyReportService: DailyReportService) {}

  generateManual = () =>
    protectedProcedure.mutation(
      executeService(
        this.dailyReportService.sendDailyReport.bind(this.dailyReportService),
      ),
    );
}
```

**Dependencias**:

- `DailyReportService`

**tRPC Procedure**:

- `dailyReport.generateManual`: mutation para trigger manual del reporte (testing/debug).

---

## Email Template Interface

```typescript
// Infrastructure/utils/Email/EmailsTemplates.ts

interface IDailyReport {
  report: DailyReport;
}

const dailyReport = ({ report }: IDailyReport) => ({
  subject: `[GestDoc] Reporte diario — ${report.companyName} — ${report.date}`,
  body: `
    <h1>Reporte Diario — ${report.companyName}</h1>
    <p>Fecha: ${report.date}</p>

    <!-- Sección 1: Empleados de licencia hoy -->
    <h2>1. Empleados de licencia hoy</h2>
    ${renderEmployeesOnLeave(report.sections.employeesOnLeaveToday)}

    <!-- Sección 2: Licencias pendientes de aprobación -->
    <h2>2. Licencias pendientes de aprobación</h2>
    ${renderPendingLicenses(report.sections.pendingLicenses)}

    <!-- Sección 3: Documentos sin firmar -->
    <h2>3. Documentos sin firmar</h2>
    ${renderUnsignedDocuments(report.sections.unsignedDocuments)}

    <!-- Sección 4: Términos y condiciones sin aceptar -->
    <h2>4. Términos y condiciones sin aceptar</h2>
    ${renderPendingDisclaimers(report.sections.pendingDisclaimerAcceptances)}

    <!-- Sección 5: Vacaciones próximas -->
    <h2>5. Vacaciones próximas (próximos 15 días)</h2>
    ${renderUpcomingVacations(report.sections.upcomingVacations)}

    <!-- Sección 6: Licencias que vencen esta semana -->
    <h2>6. Licencias que vencen esta semana</h2>
    ${renderExpiringLicenses(report.sections.expiringLicenses)}

    <!-- Sección 7: Resumen estadístico -->
    <h2>7. Resumen estadístico</h2>
    ${renderStatisticalSummary(report.sections.statisticalSummary)}

    <hr>
    <p>Este mail fue enviado de forma automática por <strong><a href="https://docs.macrosistemas.ar/" target="_blank" rel="nofollow">GestDoc</a></strong></p>
  `,
});

// Funciones helper para renderizar cada sección
function renderEmployeesOnLeave(section: EmployeesOnLeaveTodaySection): string { ... }
function renderPendingLicenses(section: PendingLicensesSection): string { ... }
function renderUnsignedDocuments(section: UnsignedDocumentsSection): string { ... }
function renderPendingDisclaimers(section: PendingDisclaimerAcceptancesSection): string { ... }
function renderUpcomingVacations(section: UpcomingVacationsSection): string { ... }
function renderExpiringLicenses(section: ExpiringLicensesSection): string { ... }
function renderStatisticalSummary(section: StatisticalSummarySection): string { ... }
```

---

## Summary

| Contrato                          | Tipo       | Descripción                                         |
| --------------------------------- | ---------- | --------------------------------------------------- |
| `GetEmployeesOnLeaveToday`        | Use Case   | Obtiene empleados de licencia hoy                   |
| `GetPendingLicenses`              | Use Case   | Obtiene licencias pendientes de aprobación          |
| `GetUnsignedDocuments`            | Use Case   | Obtiene documentos sin firmar                       |
| `GetPendingDisclaimerAcceptances` | Use Case   | Obtiene empleados sin aceptar términos              |
| `GetUpcomingVacations`            | Use Case   | Obtiene vacaciones próximas (15 días)               |
| `GetExpiringLicenses`             | Use Case   | Obtiene licencias que vencen esta semana            |
| `GetStatisticalSummary`           | Use Case   | Obtiene resumen estadístico                         |
| `GenerateDailyReport`             | Use Case   | Orquestador de todas las secciones                  |
| `GetAllActiveOwners`              | Use Case   | Obtiene todas las empresas activas                  |
| `SendReportEmail`                 | Use Case   | Envía el email del reporte                          |
| `DailyReportService`              | Service    | Orquesta generación y envío para todas las empresas |
| `DailyReportScheduler`            | Scheduler  | Cron job que dispara el reporte diario              |
| `DailyReportController`           | Controller | tRPC procedure para trigger manual                  |
| `emailTemplates.dailyReport`      | Template   | Template HTML del email                             |
