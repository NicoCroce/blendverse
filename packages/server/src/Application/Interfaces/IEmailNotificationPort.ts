import type { EmailCatalogCode } from '@server/domains/CompanyEmailSettings/Domain';

export interface EmailNotificationAttachment {
  filename: string;
  path?: string;
  content?: string | Buffer;
  contentType?: string;
}

export interface EmailNotification {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: EmailNotificationAttachment[];
  from?: string;
}

export interface InstitutionalEmailNotification extends EmailNotification {
  code: EmailCatalogCode;
  welcomeMessage: string | null;
}

export interface IEmailNotificationPort {
  sendOne(notification: InstitutionalEmailNotification): Promise<void>;
}
