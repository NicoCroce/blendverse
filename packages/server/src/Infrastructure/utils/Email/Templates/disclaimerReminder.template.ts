import { emailFooter } from './shared';
import type { IDisclaimerReminder } from './types';

/** Template: recordatorio de firma de términos y condiciones. */
export const disclaimerReminder = ({
  employeeName,
  disclaimerText,
  companyName,
}: IDisclaimerReminder) => ({
  subject: `[GestDoc] Recordatorio de firma de términos - ${companyName}`,
  body: `<h1>Recordatorio de firma de términos</h1>
              <p>Hola <strong>${employeeName}</strong>,</p>
              <p>Este es un recordatorio de que aún no ha firmado los términos y condiciones de <strong>${companyName}</strong> en GestDoc.</p>
              <p>Al ingresar nuevamente a la plataforma, se le solicitará que acepte los términos.</p>
              <h2>Texto de los términos:</h2>
              <blockquote style="border-left: 4px solid #ccc; padding-left: 16px; margin: 16px 0; color: #555;">
                ${disclaimerText}
              </blockquote>
              ${emailFooter}
              `,
});
