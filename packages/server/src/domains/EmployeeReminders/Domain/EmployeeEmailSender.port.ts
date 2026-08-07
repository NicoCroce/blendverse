/**
 * Puerto (abstracción) para el envío de emails a empleados.
 * La implementación concreta vive en Infrastructure/Email y delega en
 * MailNotificationService (Nodemailer). Mantiene la capa Application
 * desacoplada de la infraestructura de email (arquitectura hexagonal).
 */
export interface IEmployeeEmailSender {
  send(params: { to: string[]; subject: string; html: string }): Promise<void>;
}
