import { emailFooter, formatDateEs, renderSection } from './shared';
import type { IDailyReport } from './types';

/**
 * Template del reporte diario a admins. Renderiza un resumen estadístico y
 * las 7 secciones del reporte. Las secciones con datos muestran sus items;
 * las secciones vacías muestran "No existen coincidencias en este período".
 */
export const dailyReport = ({ companyName, date, sections }: IDailyReport) => {
  const stats = sections.statisticalSummary;

  return {
    subject: `[GestDoc] Reporte diario — ${companyName} — ${formatDateEs(date)}`,
    body: `<h1>Reporte diario</h1>
              <h1><strong>${companyName}</strong> — ${formatDateEs(date)}</h1>
              <h2>Resumen</h2>
              <table style="border-collapse: collapse; width: 100%; max-width: 500px; margin-bottom: 16px;">
                <tr>
                  <td style="padding: 6px 12px 6px 0; font-weight: bold; color: #374151;">Empleados activos</td>
                  <td style="padding: 6px 0; color: #111827;">${stats.activeEmployees}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px 6px 0; font-weight: bold; color: #374151;">Licencias en curso</td>
                  <td style="padding: 6px 0; color: #111827;">${stats.licensesInProgress}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px 6px 0; font-weight: bold; color: #374151;">Licencias pendientes</td>
                  <td style="padding: 6px 0; color: #111827;">${stats.pendingLicenses}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px 6px 0; font-weight: bold; color: #374151;">Documentos sin firmar</td>
                  <td style="padding: 6px 0; color: #111827;">${stats.unsignedDocuments}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px 6px 0; font-weight: bold; color: #374151;">Términos sin aceptar</td>
                  <td style="padding: 6px 0; color: #111827;">${stats.pendingDisclaimerAcceptances}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px 6px 0; font-weight: bold; color: #374151;">Empleados de licencia hoy</td>
                  <td style="padding: 6px 0; color: #111827;">${sections.employeesOnLeaveToday.totalCount}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px 6px 0; font-weight: bold; color: #374151;">Vacaciones próximas (15 días)</td>
                  <td style="padding: 6px 0; color: #111827;">${sections.upcomingVacations.totalCount}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px 6px 0; font-weight: bold; color: #374151;">Licencias que vencen esta semana</td>
                  <td style="padding: 6px 0; color: #111827;">${sections.expiringLicenses.totalCount}</td>
                </tr>
              </table>
              <hr>
              ${renderSection(
                `Empleados de licencia hoy (${sections.employeesOnLeaveToday.totalCount})`,
                sections.employeesOnLeaveToday.items.map(
                  (item) =>
                    `${item.employeeName} — ${item.licenseType} (${formatDateEs(item.startDate)} al ${formatDateEs(item.endDate)}, reintegro ${formatDateEs(item.returnDate)})`,
                ),
                true,
              )}
              ${renderSection(
                `Vacaciones próximas (${sections.upcomingVacations.totalCount})`,
                sections.upcomingVacations.items.map(
                  (item) =>
                    `${item.employeeName}${item.segmentName ? ` (${item.segmentName})` : ''} — ${formatDateEs(item.startDate)} al ${formatDateEs(item.endDate)}`,
                ),
                true,
              )}
              ${renderSection(
                `Licencias que vencen esta semana (${sections.expiringLicenses.totalCount})`,
                sections.expiringLicenses.items.map(
                  (item) =>
                    `${item.employeeName} — ${item.licenseType} (hasta ${formatDateEs(item.endDate)})`,
                ),
                true,
              )}
              ${renderSection(
                `Licencias pendientes de aprobación (${sections.pendingLicenses.totalCount})`,
                sections.pendingLicenses.items.map(
                  (item) =>
                    `${item.employeeName} — ${item.licenseType} (desde ${formatDateEs(item.startDate)}, ${item.daysSinceRequest} días)`,
                ),
              )}
              ${renderSection(
                `Documentos sin firmar (${sections.unsignedDocuments.totalCount})`,
                sections.unsignedDocuments.items.map(
                  (item) =>
                    `${item.documentTitle} — ${item.employeeName} (${item.viewStatus})`,
                ),
              )}
              ${renderSection(
                `Términos y condiciones sin aceptar (${sections.pendingDisclaimerAcceptances.totalCount})`,
                sections.pendingDisclaimerAcceptances.items.map(
                  (item) => `${item.employeeName}`,
                ),
              )}
              ${emailFooter}
              `,
  };
};
