import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { logger } from '@server/Infrastructure/utils/pino';
import { loadSmtpConfig } from './Config/smtp.config';

// ── Tipos públicos ─────────────────────────────────────────────────────────

export interface MailAttachment {
  filename: string;
  path?: string;
  content?: string | Buffer;
  contentType?: string;
}

export interface MailNotification {
  /** Destinatario(s). Puede ser un string o array de strings */
  to: string | string[];
  /** Asunto del mail */
  subject: string;
  /** Cuerpo HTML del mail */
  html?: string;
  /** Cuerpo texto plano (fallback si no hay HTML) */
  text?: string;
  /** CC */
  cc?: string | string[];
  /** BCC */
  bcc?: string | string[];
  /** Adjuntos */
  attachments?: MailAttachment[];
  /** Remitente. Si no se especifica, usa EMAIL_SMTPUSER del .env */
  from?: string;
}

export interface MailSendResult {
  /** Destinatario(s) a los que se intentó enviar */
  email: string;
  /** Direcciones aceptadas por el servidor SMTP */
  accepted: string[];
  /** Direcciones rechazadas por el servidor SMTP */
  rejected: string[];
  /** ID del mensaje asignado por el servidor */
  messageId: string;
  /** Respuesta cruda del servidor SMTP */
  response: string;
}

// ── Servicio ───────────────────────────────────────────────────────────────

export class MailNotificationService {
  private transporter: Transporter;
  private readonly defaultFrom: string;

  constructor() {
    const { host, port, secure, user, pass } = loadSmtpConfig();

    this.defaultFrom = user;
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    logger.info(
      { host, port, user },
      'MailNotificationService: transporter Nodemailer inicializado',
    );
  }

  /**
   * Envía un único mail.
   * Lanza excepción si el envío falla.
   */
  async sendOne(notification: MailNotification): Promise<MailSendResult> {
    const {
      to,
      subject,
      html,
      text,
      cc,
      bcc,
      attachments,
      from = this.defaultFrom,
    } = notification;

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        html: html ?? text,
        text: text ?? undefined,
        cc,
        bcc,
        attachments: attachments?.map((a) => ({
          filename: a.filename,
          path: a.path,
          content: a.content,
          contentType: a.contentType,
        })),
      });

      logger.info(
        { messageId: info.messageId, to },
        'MailNotificationService: email enviado correctamente',
      );

      return {
        email: Array.isArray(to) ? to.join(', ') : to,
        accepted: info.accepted as string[],
        rejected: info.rejected as string[],
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error) {
      logger.error(
        { err: error, to },
        'MailNotificationService: error al enviar email',
      );
      throw error;
    }
  }

  /**
   * Envía múltiples mails en lote.
   * No detiene el lote si un mail falla: acumula resultados y errores.
   */
  async send(
    notifications: MailNotification[],
  ): Promise<{ results: MailSendResult[]; errors: Error[] }> {
    const results: MailSendResult[] = [];
    const errors: Error[] = [];

    for (const notification of notifications) {
      try {
        const result = await this.sendOne(notification);
        results.push(result);
      } catch (error) {
        errors.push(error as Error);
        logger.error(
          { err: error, to: notification.to },
          'MailNotificationService: fallo en envío por lote, continúa con el siguiente',
        );
      }
    }

    return { results, errors };
  }

  /**
   * Verifica que la conexión SMTP esté activa.
   * Útil para health checks.
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('MailNotificationService: conexión SMTP verificada');
      return true;
    } catch (error) {
      logger.error(
        { err: error },
        'MailNotificationService: conexión SMTP fallida',
      );
      return false;
    }
  }
}
