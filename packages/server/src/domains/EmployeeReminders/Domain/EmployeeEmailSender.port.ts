/**
 * Puerto (abstracción) para el envío de emails a empleados.
 * La implementación concreta vive en Infrastructure/Email y delega en
 * MailNotificationService (Nodemailer). Mantiene la capa Application
 * desacoplada de la infraestructura de email (arquitectura hexagonal).
 */
export interface IEmployeeEmailSender {
  send(params: {
    to: string[];
    subject: string;
    html: string;
    requestContext: EmployeeEmailRequestContext;
  }): Promise<void>;
  sendReminder(params: {
    to: string[];
    reminder: IEmployeeReminder;
    welcomeMessage: string | null;
    requestContext: EmployeeEmailRequestContext;
  }): Promise<void>;
  sendNewDocument(params: {
    to: string[];
    employeeName: string;
    companyName: string;
    documents: Array<{ documentId: number; documentTitle: string }>;
    welcomeMessage: string | null;
    requestContext: EmployeeEmailRequestContext;
  }): Promise<void>;
}

export interface EmployeeEmailRequestContext {
  readonly values: {
    readonly ownerId: number;
    readonly userId: number;
  };
}

export const isValidEmployeeEmail = (email: string): boolean =>
  /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
import { IEmployeeReminder } from './EmployeeReminder.entity';
