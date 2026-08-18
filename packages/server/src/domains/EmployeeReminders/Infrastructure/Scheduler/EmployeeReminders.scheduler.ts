import cron from 'node-cron';
import type { ScheduledTask } from 'node-cron';
import { RequestContext } from '@server/Application';
import { logger } from '@server/Infrastructure/utils/pino';
import { EmployeeRemindersService } from '../../Application/EmployeeReminders.service';

const CRON_EXPRESSION = '0 9 * * *';
const CRON_TIMEZONE = 'America/Argentina/Buenos_Aires';

/**
 * Scheduler de los recordatorios diarios por empleado: dispara todos los
 * días a las 9:00 AM hora Argentina (America/Argentina/Buenos_Aires).
 * FR-001 / FR-010. `init()` es idempotente (no duplica el cron en restart).
 */
export class EmployeeRemindersScheduler {
  private task: ScheduledTask | null = null;

  constructor(
    private readonly employeeRemindersService: EmployeeRemindersService,
  ) {}

  init(): void {
    if (this.task) {
      logger.warn('Employee reminders scheduler already initialized, skipping');
      return;
    }

    this.task = cron.schedule(
      CRON_EXPRESSION,
      async () => {
        logger.info('Starting employee reminders job');

        try {
          const systemContext = new RequestContext(
            0,
            `employee-reminders-${Date.now()}`,
            0,
          );

          const result = await this.employeeRemindersService.sendDailyReminders(
            {
              requestContext: systemContext,
            },
          );

          logger.info(
            {
              sent: result.sent,
              skipped: result.skipped,
              failed: result.failed,
              totalOwners: result.totalOwners,
            },
            'Employee reminders job completed',
          );
        } catch (error) {
          logger.error({ error }, 'Employee reminders job failed');
        }
      },
      {
        timezone: CRON_TIMEZONE,
      },
    );

    logger.info(
      'Employee reminders scheduler initialized (0 9 * * * America/Argentina/Buenos_Aires)',
    );
  }

  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      logger.info('Employee reminders scheduler stopped');
    }
  }
}
