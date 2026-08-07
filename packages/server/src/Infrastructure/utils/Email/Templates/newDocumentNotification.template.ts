import { emailFooter, renderSection } from './shared';
import type { INewDocumentNotificationTemplate } from './types';

/**
 * Template de la notificación en tiempo real de documento nuevo.
 * Lista todos los documentos asignados al empleado en la misma operación
 * (FR-013). Reutiliza renderSection/emailFooter.
 */
export const newDocumentNotification = ({
  employeeName,
  companyName,
  documents,
}: INewDocumentNotificationTemplate) => {
  return {
    subject: '[GestDoc] Tienes nuevos documentos por revisar',
    body: `<h1>Hola ${employeeName}</h1>
            <p>Te asignaron nuevos documentos en <strong>${companyName}</strong>:</p>
            ${renderSection(
              `Documentos nuevos (${documents.length})`,
              documents.map((document) => document.documentTitle),
            )}
            ${emailFooter}`,
  };
};
