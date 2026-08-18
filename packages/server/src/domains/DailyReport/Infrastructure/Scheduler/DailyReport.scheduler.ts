import cron from 'node-cron';
import type { ScheduledTask } from 'node-cron';
import { RequestContext } from '@server/Application';
import { logger } from '@server/Infrastructure/utils/pino';
import { DailyReportService } from '../../Application/DailyReport.service';

const CRON_EXPRESSION = '0 9 * * *';
const CRON_TIMEZONE = 'America/Argentina/Buenos_Aires';

/**
 * Scheduler del reporte diario: dispara todos los días a las 9:00 AM
 * hora Argentina (America/Argentina/Buenos_Aires). FR-001 / FR-015.
 */
export class DailyReportScheduler {
  private task: ScheduledTask | null = null;

  constructor(private readonly dailyReportService: DailyReportService) {}

  init(): void {
    if (this.task) {
      logger.warn('Daily report scheduler already initialized, skipping');
      return;
    }

    this.task = cron.schedule(
      CRON_EXPRESSION,
      async () => {
        logger.info('Starting daily report job');

        try {
          const systemContext = new RequestContext(
            0,
            `daily-report-${Date.now()}`,
            0,
          );

          const result = await this.dailyReportService.sendDailyReport({
            requestContext: systemContext,
          });

          logger.info(
            {
              sent: result.sent,
              failed: result.failed,
              total: result.total,
            },
            'Daily report job completed',
          );
        } catch (error) {
          logger.error({ error }, 'Daily report job failed');
        }
      },
      {
        timezone: CRON_TIMEZONE,
      },
    );

    logger.info(
      'Daily report scheduler initialized (0 9 * * * America/Argentina/Buenos_Aires)',
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
