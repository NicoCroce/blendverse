/**
 * Puerto (abstracción) para el envío del email del reporte diario.
 * La implementación concreta vive en Infrastructure/Email y usa
 * MailNotificationService (Nodemailer). Mantiene la capa Application
 * desacoplada de la infraestructura de email (arquitectura hexagonal).
 */
export interface IDailyReportEmailSender {
  send(params: {
    to: string[];
    report: DailyReport;
    welcomeMessage: string | null;
    requestContext: {
      readonly values: {
        readonly ownerId: number;
        readonly userId: number;
      };
    };
  }): Promise<void>;
}
import { DailyReport } from './DailyReport.entity';
