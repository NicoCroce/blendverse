import { IUseCase } from '@server/Application';
import { emailTemplates } from '@server/Infrastructure';
import { isValidEmail } from '@server/Infrastructure';
import { logger } from '@server/Infrastructure/utils/pino';
import { IEmployeeEmailSender } from '../../Domain/EmployeeEmailSender.port';
import {
  ISendEmployeeReminderEmail,
  ISendEmployeeReminderEmailInput,
  ISendEmployeeReminderEmailOutput,
} from '../employeeReminders.types';

/**
 * Envía el email diario de pendientes de un empleado.
 * Solo envía si `shouldSend` (FR-008); sin email válido omite y loguea
 * (FR-009). Usa el puerto hexagonal IEmployeeEmailSender (sin dependencia
 * de infraestructura en la capa Application).
 */
export class SendEmployeeReminderEmail implements IUseCase<
  ISendEmployeeReminderEmailOutput,
  ISendEmployeeReminderEmailInput
> {
  constructor(private readonly employeeEmailSender: IEmployeeEmailSender) {}

  async execute({
    input,
    requestContext,
  }: ISendEmployeeReminderEmail): Promise<ISendEmployeeReminderEmailOutput> {
    const { reminder } = input;
    const ownerId = requestContext.values.ownerId;

    if (!reminder.shouldSend) {
      logger.info(
        { ownerId, employeeId: reminder.employeeId },
        'Employee reminder skipped: no pending actions',
      );
      return { sent: false };
    }

    if (!isValidEmail(reminder.employeeEmail)) {
      logger.warn(
        {
          ownerId,
          employeeId: reminder.employeeId,
          email: reminder.employeeEmail,
        },
        'Employee reminder skipped: invalid email',
      );
      return { sent: false };
    }

    const { subject, body } = emailTemplates.employeeDailyReminder(reminder);

    await this.employeeEmailSender.send({
      to: [reminder.employeeEmail],
      subject,
      html: body,
    });

    return { sent: true };
  }
}
