import { executeUseCase, IUseCase } from '@server/Application';
import { GetEmployeesByCompany } from '@server/domains/Disclaimer/Application';
import { GetPendingDocumentsByEmployees } from '@server/domains/Documents/Application';
import { buildEmployeeName, formatDate } from '@server/Infrastructure';
import {
  EmployeeReminder,
  IEmployeeReminder,
} from '../../Domain/EmployeeReminder.entity';
import {
  IGenerateDailyReminder,
  IGenerateDailyReminderInput,
  IGenerateDailyReminderOutput,
} from '../employeeReminders.types';

// `GetEmployeesByCompany` pagina con default 10; el batch necesita todos los
// empleados de la empresa, por lo que se pide un límite alto explícito.
const MAX_EMPLOYEES_LIMIT = '100000';

/**
 * Orquesta los pendientes de TODOS los empleados de una empresa para el email
 * diario (US1–US5). Usa `_getEmployeesByCompany` (Disclaimer) para los
 * pendientes de cuenta (renovar_clave, estado_firma) y
 * `_getPendingDocumentsByEmployees` (Documents, batch) para documentos sin
 * firmar / sin visualizar — UNA sola consulta para toda la empresa (mejora
 * N+1) y agrupación en memoria por empleado. Ensambla los `IEmployeeReminder`
 * y calcula `shouldSend` por empleado (FR-008).
 */
export class GenerateDailyReminder implements IUseCase<
  IGenerateDailyReminderOutput,
  IGenerateDailyReminderInput
> {
  constructor(
    private readonly _getEmployeesByCompany: GetEmployeesByCompany,
    private readonly _getPendingDocumentsByEmployees: GetPendingDocumentsByEmployees,
  ) {}

  async execute({
    input,
    requestContext,
  }: IGenerateDailyReminder): Promise<IGenerateDailyReminderOutput> {
    const ownerId = requestContext.values.ownerId;

    const { data: employees } = await executeUseCase({
      useCase: this._getEmployeesByCompany,
      input: { ownerId, page: '1', limit: MAX_EMPLOYEES_LIMIT },
      requestContext,
    });

    const employeeIds = employees.map((employee) => employee.id);

    // Una sola query batch para todos los empleados de la empresa.
    const pendingDocuments = await executeUseCase({
      useCase: this._getPendingDocumentsByEmployees,
      input: { employeeIds },
      requestContext,
    });

    // Agrupación en memoria por empleado: evita el N+1 original (una query por
    // empleado) manteniendo el mismo resultado.
    const pendingByEmployee = new Map<number, typeof pendingDocuments>();
    for (const document of pendingDocuments) {
      const group = pendingByEmployee.get(document.employeeId) ?? [];
      group.push(document);
      pendingByEmployee.set(document.employeeId, group);
    }

    const reminders: IEmployeeReminder[] = [];

    for (const employee of employees) {
      const employeePending = pendingByEmployee.get(employee.id) ?? [];

      const unsignedDocuments = employeePending
        .filter((document) => document.isUnsigned)
        .map((document) => ({
          documentId: document.documentId,
          documentTitle: document.documentTitle,
        }));

      const unviewedDocuments = employeePending
        .filter((document) => document.isUnviewed)
        .map((document) => ({
          documentId: document.documentId,
          documentTitle: document.documentTitle,
        }));

      const reminder = EmployeeReminder.create({
        ownerId,
        employeeId: employee.id,
        employeeName: buildEmployeeName(employee),
        employeeEmail: employee.email,
        companyName: input.companyName,
        date: formatDate(new Date()),
        pending: {
          unsignedDocuments,
          unviewedDocuments,
          pendingDisclaimerAcceptance: employee.estado_firma !== 'Firmado',
          renewPassword: employee.renovar_clave,
        },
      });

      reminders.push(reminder.values);
    }

    return { reminders };
  }
}
