import { emailFooter } from './shared';
import type { IDocumentSignedAdmin, IDocumentSignedEmployee } from './types';

/** Template: notificación a los admins de que un empleado firmó un documento. */
export const documentSignedAdmin = ({
  employeeName,
  documentId,
  agreement,
  reasonSignatureNonConformity,
}: IDocumentSignedAdmin) => ({
  subject: `[GestDoc] ${employeeName} ha firmado un documento`,
  body: `<h1>Documento firmado</h1>
              <p>El empleado <strong>${employeeName}</strong> ha firmado el documento <strong>#${documentId}</strong>.</p>
              <h2>Detalle de la firma</h2>
              <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
                <tr>
                  <td style="padding: 6px 12px 6px 0; font-weight: bold; color: #374151;">Documento</td>
                  <td style="padding: 6px 0; color: #111827;">#${documentId}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px 6px 0; font-weight: bold; color: #374151;">Tipo de firma</td>
                  <td style="padding: 6px 0;">
                    <span style="display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 13px; font-weight: 600; ${agreement ? 'background-color: #dcfce7; color: #166534;' : 'background-color: #fee2e2; color: #991b1b;'}">
                      ${agreement ? 'Bajo acuerdo' : 'Sin conformidad'}
                    </span>
                  </td>
                </tr>
                ${
                  !agreement && reasonSignatureNonConformity
                    ? `
                <tr>
                  <td style="padding: 6px 12px 6px 0; font-weight: bold; color: #374151;">Motivo</td>
                  <td style="padding: 6px 0; color: #111827;">${reasonSignatureNonConformity}</td>
                </tr>`
                    : ''
                }
              </table>
              ${emailFooter}
              `,
});

/** Template: confirmación al empleado de que firmó un documento. */
export const documentSignedEmployee = ({
  employeeName,
  documentId,
  agreement,
  reasonSignatureNonConformity,
}: IDocumentSignedEmployee) => ({
  subject: `[GestDoc] Has firmado el documento #${documentId}`,
  body: `<h1>Confirmación de firma</h1>
              <p>Hola <strong>${employeeName}</strong>,</p>
              <p>Has firmado el documento <strong>#${documentId}</strong>.</p>
              <h2>Detalle de la firma</h2>
              <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
                <tr>
                  <td style="padding: 6px 12px 6px 0; font-weight: bold; color: #374151;">Documento</td>
                  <td style="padding: 6px 0; color: #111827;">#${documentId}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px 6px 0; font-weight: bold; color: #374151;">Tipo de firma</td>
                  <td style="padding: 6px 0;">
                    <span style="display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 13px; font-weight: 600; ${agreement ? 'background-color: #dcfce7; color: #166534;' : 'background-color: #fee2e2; color: #991b1b;'}">
                      ${agreement ? 'Bajo acuerdo' : 'Sin conformidad'}
                    </span>
                  </td>
                </tr>
                ${
                  !agreement && reasonSignatureNonConformity
                    ? `
                <tr>
                  <td style="padding: 6px 12px 6px 0; font-weight: bold; color: #374151;">Motivo</td>
                  <td style="padding: 6px 0; color: #111827;">${reasonSignatureNonConformity}</td>
                </tr>`
                    : ''
                }
              </table>
              ${emailFooter}
              `,
});
