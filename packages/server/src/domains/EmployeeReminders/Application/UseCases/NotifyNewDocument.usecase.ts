import { IUseCase } from '@server/Application';
import { emailTemplates } from '@server/Infrastructure';
import { isValidEmail } from '@server/Infrastructure';
import { logger } from '@server/Infrastructure/utils/pino';
import { IEmployeeEmailSender } from '../../Domain/EmployeeEmailSender.port';
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
  constructor(private readonly employeeEmailSender: IEmployeeEmailSender) {}

  async execute({
    input,
  }: INotifyNewDocument): Promise<INotifyNewDocumentOutput> {
    if (!isValidEmail(input.employeeEmail)) {
      logger.warn(
        {
          ownerId: input.ownerId,
          employeeId: input.employeeId,
          email: input.employeeEmail,
        },
        'New document notification skipped: invalid email',
      );
      return { notified: false };
    }

    try {
      const { subject, body } = emailTemplates.newDocumentNotification(input);

      await this.employeeEmailSender.send({
        to: [input.employeeEmail],
        subject,
        html: body,
      });

      return { notified: true };
    } catch (error) {
      logger.error(
        { error, ownerId: input.ownerId, employeeId: input.employeeId },
        'New document notification failed',
      );
      return { notified: false };
    }
  }
}
