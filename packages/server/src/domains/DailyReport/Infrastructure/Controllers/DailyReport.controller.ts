import { protectedProcedure } from '@server/Infrastructure';
import { executeServiceAlone } from '@server/Application';
import { DailyReportService } from '../../Application';

/**
 * Controller del reporte diario. Expone el trigger manual (testing/debug)
 * que dispara la generación y envío del reporte para todas las empresas.
 */
export class DailyReportController {
  constructor(private readonly dailyReportService: DailyReportService) {}

  generateManual = protectedProcedure.mutation(
    executeServiceAlone(
      this.dailyReportService.sendDailyReport.bind(this.dailyReportService),
    ),
  );
}
