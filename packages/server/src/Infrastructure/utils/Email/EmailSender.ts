import axios from 'axios';
import { logger } from '@server/Infrastructure/utils/pino';

const _body = {
  settings: {
    smtpServer: process.env.EMAIL_SMTPSERVER,
    smtpPort: process.env.EMAIL_SMTPPORT,
    smtpUser: process.env.EMAIL_SMTPUSER,
    smtpPassword: process.env.EMAIL_SMTPPASSWORD,
    smtpRequirePass: 'true',
    smtpConexionType: 'none',
    token: process.env.EMAIL_TOKEN,
    cuit: process.env.EMAIL_CUIT,
  },
  mailInfo: {
    address: ['nicoc123@gmail.com'],
    from: 'gestdoc@macrosistemas.ar',
    subject: 'Gestdoc - Aviso de una nueva licencia',
    body: 'Prueba realizada desde GestDoc',
  },
  footer: {
    signature: '',
    extension: '',
  },
};

interface SendEmailProps {
  to: string[];
  subject?: string;
  body: string;
}

export const EmailSender = async ({ to, body, subject }: SendEmailProps) => {
  const requestBody = {
    ..._body,
    mailInfo: {
      ..._body.mailInfo,
      address: to,
      subject,
      body,
    },
  };
  try {
    const response = await axios.post(process.env.EMAIL_HOST!, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data?.status && response.data.status !== 200) {
      throw new Error(
        response.data.detail ?? response.data.msg ?? 'Email service error',
      );
    }

    logger.info('Email enviado con éxito:', response.data);

    return response.data;
  } catch (error) {
    logger.error({ err: error }, 'Error al enviar el email');
    throw error;
  }
};
