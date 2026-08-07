import {
  executeUseCase,
  IRequestContext,
  RequestContext,
} from '@server/Application';
import { logger } from '@server/Infrastructure/utils/pino';
import { GetAllActiveOwners } from '@server/domains/Users/Application';
import { GenerateDailyReminder } from './UseCases/GenerateDailyReminder.usecase';
import { SendEmployeeReminderEmail } from './UseCases/SendEmployeeReminderEmail.usecase';
import { ISendDailyRemindersOutput } from './employeeReminders.types';

/**
 * Orquesta la generación y envío de los recordatorios diarios por empleado
 * para todas las empresas activas. Resiliencia multi-tenant (FR-003): un
 * fallo en una empresa no bloquea a las demás, y un fallo por empleado no
 * bloquea al resto de su empresa. Logging con ownerId/employeeId (FR-009).
 */
export class EmployeeRemindersService {
  constructor(
    private readonly _getAllActiveOwners: GetAllActiveOwners,
    private readonly _generateDailyReminder: GenerateDailyReminder,
    private readonly _sendEmployeeReminderEmail: SendEmployeeReminderEmail,
  ) {}

  async sendDailyReminders({
    requestContext,
  }: IRequestContext): Promise<ISendDailyRemindersOutput> {
    const owners = await executeUseCase({
      useCase: this._getAllActiveOwners,
      requestContext,
    });

    if (owners.length === 0) {
      logger.info('No active companies to process for employee reminders');
    }

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const owner of owners) {
      try {
        // RequestContext sintético por empresa (no hay usuario autenticado)
        const ownerContext = new RequestContext(
          0,
          `employee-reminders-${owner.id}-${Date.now()}`,
          owner.id,
        );

        const { reminders } = await executeUseCase({
          useCase: this._generateDailyReminder,
          input: { companyName: owner.denominacion },
          requestContext: ownerContext,
        });

        for (const reminder of reminders) {
          try {
            const { sent: sentEmail } = await executeUseCase({
              useCase: this._sendEmployeeReminderEmail,
              input: { reminder },
              requestContext: ownerContext,
            });

            if (sentEmail) {
              sent++;
            } else {
              skipped++;
            }
          } catch (error) {
            failed++;
            logger.error(
              { ownerId: owner.id, employeeId: reminder.employeeId, error },
              'Failed to send employee reminder email',
            );
          }
        }
      } catch (error) {
        failed++;
        logger.error(
          { ownerId: owner.id, error },
          'Failed to generate employee reminders for owner',
        );
      }
    }

    return { sent, skipped, failed, totalOwners: owners.length };
  }
}
