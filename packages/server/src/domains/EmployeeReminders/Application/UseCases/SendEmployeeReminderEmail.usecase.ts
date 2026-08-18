import { IUseCase } from '@server/Application';
import { ResolveEmailDeliveryPolicy } from '@server/domains/CompanyEmailSettings/Application';
import {
  IEmployeeEmailSender,
  isValidEmployeeEmail,
} from '../../Domain/EmployeeEmailSender.port';
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
  constructor(
    private readonly employeeEmailSender: IEmployeeEmailSender,
    private readonly _resolveEmailDeliveryPolicy?: ResolveEmailDeliveryPolicy,
  ) {}

  async execute({
    input,
    requestContext,
  }: ISendEmployeeReminderEmail): Promise<ISendEmployeeReminderEmailOutput> {
    const { reminder } = input;

    const policy = this._resolveEmailDeliveryPolicy
      ? await this._resolveEmailDeliveryPolicy.execute({
          input: { code: 'employee_daily_reminder' },
          requestContext,
        })
      : { enabled: false, welcomeMessage: null };
    if (!policy.enabled) return { sent: false };

    if (!reminder.shouldSend) {
      return { sent: false };
    }

    if (!isValidEmployeeEmail(reminder.employeeEmail)) {
      return { sent: false };
    }

    await this.employeeEmailSender.sendReminder({
      to: [reminder.employeeEmail],
      reminder,
      welcomeMessage: policy.welcomeMessage,
      requestContext,
    });

    return { sent: true };
  }
}
