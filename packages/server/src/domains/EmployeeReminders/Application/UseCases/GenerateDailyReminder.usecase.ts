import { executeUseCase, IUseCase } from '@server/Application';
import { GetEmployeesByCompany } from '@server/domains/Disclaimer/Application';
import { GetPendingDocumentsByEmployee } from '@server/domains/Documents/Application';
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
 * Orquesta los pendientes de UN empleado para el email diario (US1–US5).
 * Usa `_getEmployeesByCompany` (Disclaimer) para los pendientes de cuenta
 * (renovar_clave, estado_firma) y `_getPendingDocumentsByEmployee`
 * (Documents) para documentos sin firmar / sin visualizar. Ensambla el
 * `IEmployeeReminder` y calcula `shouldSend` (FR-008).
 */
export class GenerateDailyReminder implements IUseCase<
  IGenerateDailyReminderOutput,
  IGenerateDailyReminderInput
> {
  constructor(
    private readonly _getEmployeesByCompany: GetEmployeesByCompany,
    private readonly _getPendingDocumentsByEmployee: GetPendingDocumentsByEmployee,
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

    const reminders: IEmployeeReminder[] = [];

    for (const employee of employees) {
      const pendingDocuments = await executeUseCase({
        useCase: this._getPendingDocumentsByEmployee,
        input: { employeeId: employee.id },
        requestContext,
      });

      const unsignedDocuments = pendingDocuments
        .filter((document) => document.isUnsigned)
        .map((document) => ({
          documentId: document.documentId,
          documentTitle: document.documentTitle,
        }));

      const unviewedDocuments = pendingDocuments
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
