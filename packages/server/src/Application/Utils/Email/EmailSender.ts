import { logger } from '@server/utils/pino';
import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

interface SendEmailProps {
  to: string[];
  cc?: string[];
  subject?: string;
  body: string;
}

export const EmailSender = async ({
  to,
  cc,
  body,
  subject,
}: SendEmailProps) => {
  // Validar que las variables de entorno estén configuradas
  const smtpServer = process.env.EMAIL_SMTPSERVER;
  const smtpPort = Number(process.env.EMAIL_SMTPPORT) || 587;
  const smtpUser = process.env.EMAIL_SMTPUSER;
  const smtpPassword = process.env.EMAIL_SMTPPASSWORD;

  if (!smtpServer || !smtpUser || !smtpPassword) {
    const missingVars = [];
    if (!smtpServer) missingVars.push('EMAIL_SMTPSERVER');
    if (!smtpUser) missingVars.push('EMAIL_SMTPUSER');
    if (!smtpPassword) missingVars.push('EMAIL_SMTPPASSWORD');

    logger.error({ missingVars }, 'Variables de entorno SMTP no configuradas');
    throw new Error(
      `Variables de entorno SMTP no configuradas: ${missingVars.join(', ')}`,
    );
  }

  logger.info(
    {
      host: smtpServer,
      port: smtpPort,
      secure: smtpPort === 465,
      user: smtpUser,
    },
    'Configuración SMTP',
  );

  // Configurar el transportador SMTP
  const transportConfig: SMTPTransport.Options = {
    host: smtpServer,
    port: smtpPort,
    secure: smtpPort === 465, // true para puerto 465, false para otros puertos
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
    // Configuración TLS mejorada
    tls: {
      rejectUnauthorized: true, // Más estricto para producción
      minVersion: 'TLSv1.2',
    },
    // Timeout más largo
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    // Debug para ver más información
    debug: false,
    logger: false,
  };

  const transporter = nodemailer.createTransport(transportConfig);

  // Verificar la conexión antes de enviar (opcional pero recomendado)
  try {
    await transporter.verify();
    logger.info('Conexión SMTP verificada correctamente');
  } catch (verifyError: unknown) {
    const errorMessage =
      verifyError instanceof Error ? verifyError.message : 'Error desconocido';
    logger.error(
      { error: verifyError, message: errorMessage },
      'Error al verificar conexión SMTP',
    );
    throw new Error(`No se pudo conectar al servidor SMTP: ${errorMessage}`, {
      cause: verifyError,
    });
  }

  // Extraer texto plano del HTML (simple)
  const textBody = body
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const mailOptions = {
    from: `"MacroSistemas Portal" <${smtpUser}>`,
    to: to.join(', '),
    cc: cc?.join(', '),
    subject: subject || 'MsPortal - Notificación',
    text: textBody, // IMPORTANTE: versión texto plano
    html: body,
    replyTo: smtpUser,
    encoding: 'utf-8',
    headers: {
      'X-Mailer': 'MacroSistemas B2B Portal',
      'X-Priority': '3',
      Precedence: 'bulk', // Indica que es email transaccional automatizado
      'X-Auto-Response-Suppress': 'OOF, DR, RN, NRN, AutoReply',
      'List-Unsubscribe': `<mailto:${smtpUser}?subject=unsubscribe>`,
    },
  };

  logger.info(
    {
      from: mailOptions.from,
      to: mailOptions.to,
      cc: mailOptions.cc,
      subject: mailOptions.subject,
    },
    'Enviando email con los siguientes datos',
  );

  try {
    const info = await transporter.sendMail(mailOptions);

    logger.info(
      {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected,
        pending: info.pending,
      },
      'Email enviado con éxito',
    );

    // Log adicional para debugging
    if (info.rejected && info.rejected.length > 0) {
      logger.warn(
        { rejected: info.rejected },
        'Algunos destinatarios fueron rechazados',
      );
    }

    return info;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    const errorCode =
      typeof error === 'object' && error !== null && 'code' in error
        ? String(error.code)
        : undefined;
    const errorCommand =
      typeof error === 'object' && error !== null && 'command' in error
        ? String(error.command)
        : undefined;

    logger.error(
      { error, message: errorMessage, code: errorCode, command: errorCommand },
      'Error al enviar el email',
    );
    throw error;
  }
};
