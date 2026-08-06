/**
 * Puerto (abstracción) para el envío del email del reporte diario.
 * La implementación concreta vive en Infrastructure/Email y usa
 * MailNotificationService (Nodemailer). Mantiene la capa Application
 * desacoplada de la infraestructura de email (arquitectura hexagonal).
 */
export interface IDailyReportEmailSender {
  send(params: { to: string[]; subject: string; html: string }): Promise<void>;
}
