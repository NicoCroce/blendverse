import { IUseCase } from '@server/Application';
import { ResolveEmailDeliveryPolicy } from '@server/domains/CompanyEmailSettings/Application';
import {
  IEmployeeEmailSender,
  isValidEmployeeEmail,
} from '../../Domain/EmployeeEmailSender.port';
import {
  INewDocumentNotification,
  INotifyNewDocument,
  INotifyNewDocumentOutput,
} from '../employeeReminders.types';

/**
 * Notificación en tiempo real de documento nuevo (US6).
 * Un email por empleado agrupa todos los documentos de la operación
 * (FR-013). Sin email válido → omitir + log (FR-014). Fallo del puerto →
 * log sin relanzar (FR-015): el documento queda cubierto por el batch diario.
 */
export class NotifyNewDocument implements IUseCase<
  INotifyNewDocumentOutput,
  INewDocumentNotification
> {
  constructor(
    private readonly employeeEmailSender: IEmployeeEmailSender,
    private readonly _resolveEmailDeliveryPolicy?: ResolveEmailDeliveryPolicy,
  ) {}

  async execute({
    input,
    requestContext,
  }: INotifyNewDocument): Promise<INotifyNewDocumentOutput> {
    const policy = this._resolveEmailDeliveryPolicy
      ? await this._resolveEmailDeliveryPolicy.execute({
          input: { code: 'employee_document_assigned' },
          requestContext,
        })
      : { enabled: false, welcomeMessage: null };
    if (!policy.enabled) return { notified: false };
    if (!isValidEmployeeEmail(input.employeeEmail)) {
      return { notified: false };
    }

    try {
      await this.employeeEmailSender.sendNewDocument({
        to: [input.employeeEmail],
        employeeName: input.employeeName,
        companyName: input.companyName,
        documents: input.documents,
        welcomeMessage: policy.welcomeMessage,
        requestContext,
      });

      return { notified: true };
    } catch {
      return { notified: false };
    }
  }
}
