import { emailFooter, formatDateEs, renderSection } from './shared';
import type { IDailyReport } from './types';
import { REPORT_SECTION_CODES } from '@server/domains/CompanyEmailSettings/Domain';

/**
 * Template del reporte diario a admins. Renderiza únicamente el resumen y las
 * secciones autorizadas por la configuración de la empresa.
 */
export const dailyReport = ({
  companyName,
  date,
  sections,
  selectedSections: selectedSectionValues,
}: IDailyReport) => {
  const selectedSections = new Set(
    selectedSectionValues ?? REPORT_SECTION_CODES,
  );
  const stats = sections.statisticalSummary;
  const renderSelected = (code: string, content: string): string =>
    selectedSections.has(code) ? content : '';

  return {
    subject: `[GestDoc] Reporte diario — ${companyName} — ${formatDateEs(date)}`,
    body: `<h1>Reporte diario</h1>
              <h1><strong>${companyName}</strong> — ${formatDateEs(date)}</h1>
               ${renderSelected('statistical_summary', '<h2>Resumen</h2>')}
               ${renderSelected(
                 'statistical_summary',
                 `
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
               </table>`,
               )}
               ${renderSelected('statistical_summary', '<hr>')}
               ${renderSelected(
                 'employees_on_leave_today',
                 renderSection(
                   `Empleados de licencia hoy (${sections.employeesOnLeaveToday.totalCount})`,
                   sections.employeesOnLeaveToday.items.map(
                     (item) =>
                       `${item.employeeName} — ${item.licenseType} (${formatDateEs(item.startDate)} al ${formatDateEs(item.endDate)}, reintegro ${formatDateEs(item.returnDate)})`,
                   ),
                   true,
                 ),
               )}
               ${renderSelected(
                 'upcoming_vacations',
                 renderSection(
                   `Vacaciones próximas (${sections.upcomingVacations.totalCount})`,
                   sections.upcomingVacations.items.map(
                     (item) =>
                       `${item.employeeName}${item.segmentName ? ` (${item.segmentName})` : ''} — ${formatDateEs(item.startDate)} al ${formatDateEs(item.endDate)}`,
                   ),
                   true,
                 ),
               )}
               ${renderSelected(
                 'expiring_licenses',
                 renderSection(
                   `Licencias que vencen esta semana (${sections.expiringLicenses.totalCount})`,
                   sections.expiringLicenses.items.map(
                     (item) =>
                       `${item.employeeName} — ${item.licenseType} (hasta ${formatDateEs(item.endDate)})`,
                   ),
                   true,
                 ),
               )}
               ${renderSelected(
                 'pending_licenses',
                 renderSection(
                   `Licencias pendientes de aprobación (${sections.pendingLicenses.totalCount})`,
                   sections.pendingLicenses.items.map(
                     (item) =>
                       `${item.employeeName} — ${item.licenseType} (desde ${formatDateEs(item.startDate)}, ${item.daysSinceRequest} días)`,
                   ),
                 ),
               )}
               ${renderSelected(
                 'unsigned_documents',
                 renderSection(
                   `Documentos sin firmar (${sections.unsignedDocuments.totalCount})`,
                   sections.unsignedDocuments.items.map(
                     (item) =>
                       `${item.documentTitle} — ${item.employeeName} (${item.viewStatus})`,
                   ),
                 ),
               )}
               ${renderSelected(
                 'pending_terms_acceptance',
                 renderSection(
                   `Términos y condiciones sin aceptar (${sections.pendingDisclaimerAcceptances.totalCount})`,
                   sections.pendingDisclaimerAcceptances.items.map(
                     (item) => `${item.employeeName}`,
                   ),
                 ),
               )}
              ${emailFooter}
              `,
  };
};
