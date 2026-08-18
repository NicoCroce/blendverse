/**
 * Configuración SMTP para el envío de emails.
 * Lee las variables de entorno EMAIL_* y valida que las críticas existan.
 */

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

/**
 * Carga y valida la configuración SMTP desde el entorno.
 * Lanza error si faltan variables críticas (EMAIL_SMTPSERVER, EMAIL_SMTPUSER,
 * EMAIL_SMTPPASSWORD).
 */
export const loadSmtpConfig = (): SmtpConfig => {
  const host = process.env.EMAIL_SMTPSERVER;
  const port = Number(process.env.EMAIL_SMTPPORT) || 587;
  const user = process.env.EMAIL_SMTPUSER;
  const pass = process.env.EMAIL_SMTPPASSWORD;

  if (!host || !user || !pass) {
    throw new Error(
      'Faltan variables de entorno EMAIL_SMTPSERVER, EMAIL_SMTPUSER, EMAIL_SMTPPASSWORD',
    );
  }

  return {
    host,
    port,
    secure: port === 465,
    user,
    pass,
  };
};
