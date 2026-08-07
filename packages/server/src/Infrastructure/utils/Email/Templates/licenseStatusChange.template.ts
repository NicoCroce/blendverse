import { emailFooter } from './shared';
import type { ILicenseStatusChange } from './types';

/** Template: notificación al empleado del estado de su licencia (aprobada/rechazada). */
export const licenseStatusChange = ({
  employeeName,
  reviewerName,
  licenseType,
  startDate,
  endDate,
  returnDate,
  reason,
  status,
}: ILicenseStatusChange) => ({
  subject: `[GestDoc] Su licencia ha sido ${status === 'aprobado' ? 'aprobada' : 'rechazada'}`,
  body: `<h1>Actualización de licencia</h1>
              <p>Hola <strong>${employeeName}</strong>,</p>
              <p>Su licencia ha sido <strong>${status === 'aprobado' ? 'aprobada' : 'rechazada'}</strong> por <strong>${reviewerName}</strong>.</p>
              <h2>Detalle de la licencia</h2>
              <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
                <tr>
                  <td style="padding: 6px 12px 6px 0; font-weight: bold; color: #374151;">Tipo</td>
                  <td style="padding: 6px 0; color: #111827;">${licenseType}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px 6px 0; font-weight: bold; color: #374151;">Fecha de inicio</td>
                  <td style="padding: 6px 0; color: #111827;">${startDate}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px 6px 0; font-weight: bold; color: #374151;">Fecha de fin</td>
                  <td style="padding: 6px 0; color: #111827;">${endDate}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px 6px 0; font-weight: bold; color: #374151;">Fecha de reintegro</td>
                  <td style="padding: 6px 0; color: #111827;">${returnDate}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px 6px 0; font-weight: bold; color: #374151;">Motivo</td>
                  <td style="padding: 6px 0; color: #111827;">${reason}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px 6px 0; font-weight: bold; color: #374151;">Estado</td>
                  <td style="padding: 6px 0;">
                    <span style="display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 13px; font-weight: 600; ${status === 'aprobado' ? 'background-color: #dcfce7; color: #166534;' : 'background-color: #fee2e2; color: #991b1b;'}">
                      ${status === 'aprobado' ? 'Aprobado' : 'Rechazado'}
                    </span>
                  </td>
                </tr>
              </table>
              ${emailFooter}
              `,
});
