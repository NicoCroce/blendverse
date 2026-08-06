interface IAddLincence {
  currentUser: string;
  reason: string;
}

interface IDocumentSignedAdmin {
  employeeName: string;
  documentId: number;
  agreement: boolean;
  reasonSignatureNonConformity: string | null;
}

interface IDocumentSignedEmployee {
  employeeName: string;
  documentId: number;
  agreement: boolean;
  reasonSignatureNonConformity: string | null;
}

const addLicense = ({ currentUser, reason }: IAddLincence) => ({
  subject: `[Aviso] Gestdoc - Nueva licencia de ${currentUser}`,
  body: `<h1> Nueva licencia</h1> 
              <p>El empleado <strong> ${currentUser} </strong> agregó una licencia<p>
              <h2>Descripción de la licencia</h2>
              <p>${reason}</p>
              <hr>
              <p>Este mail fue enviado de forma automática por <strong><a href="https://docs.macrosistemas.ar/" target="_blank" rel="nofollow">GestDoc</a></strong></p>
              `,
});

interface ILicenseStatusChange {
  employeeName: string;
  reviewerName: string;
  licenseType: string;
  startDate: string;
  endDate: string;
  returnDate: string;
  reason: string;
  status: 'aprobado' | 'rechazado';
}

interface IDisclaimerReminder {
  employeeName: string;
  disclaimerText: string;
  companyName: string;
}

const licenseStatusChange = ({
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
              <hr>
              <p>Este mail fue enviado de forma automática por <strong><a href="https://docs.macrosistemas.ar/" target="_blank" rel="nofollow">GestDoc</a></strong></p>
              `,
});

const documentSignedAdmin = ({
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
              <hr>
              <p>Este mail fue enviado de forma automática por <strong><a href="https://docs.macrosistemas.ar/" target="_blank" rel="nofollow">GestDoc</a></strong></p>
              `,
});

const documentSignedEmployee = ({
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
              <hr>
              <p>Este mail fue enviado de forma automática por <strong><a href="https://docs.macrosistemas.ar/" target="_blank" rel="nofollow">GestDoc</a></strong></p>
              `,
});

const disclaimerReminder = ({
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
              <hr>
              <p>Este mail fue enviado de forma automática por <strong><a href="https://docs.macrosistemas.ar/" target="_blank" rel="nofollow">GestDoc</a></strong></p>
              `,
});

interface IDailyReport {
  companyName: string;
  date: string;
  sections: {
    employeesOnLeaveToday: {
      items: Array<{
        employeeName: string;
        licenseType: string;
        startDate: string;
        endDate: string;
        returnDate: string;
      }>;
      totalCount: number;
    };
    pendingLicenses: {
      items: Array<{
        employeeName: string;
        licenseType: string;
        startDate: string;
        daysSinceRequest: number;
      }>;
      totalCount: number;
    };
    unsignedDocuments: {
      items: Array<{
        documentTitle: string;
        employeeName: string;
        viewStatus: string;
      }>;
      totalCount: number;
    };
    pendingDisclaimerAcceptances: {
      items: Array<{ employeeName: string }>;
      totalCount: number;
    };
    upcomingVacations: {
      items: Array<{
        employeeName: string;
        segmentName: string | null;
        startDate: string;
        endDate: string;
      }>;
      totalCount: number;
    };
    expiringLicenses: {
      items: Array<{
        employeeName: string;
        licenseType: string;
        endDate: string;
      }>;
      totalCount: number;
    };
    statisticalSummary: {
      activeEmployees: number;
      licensesInProgress: number;
      pendingLicenses: number;
      unsignedDocuments: number;
      pendingDisclaimerAcceptances: number;
    };
  };
}

const renderSection = (title: string, items: string[]): string => {
  if (items.length === 0) return '';

  const rows = items
    .map(
      (item) =>
        `<tr><td style="padding: 6px 12px 6px 0; color: #111827;">${item}</td></tr>`,
    )
    .join('');

  return `<h3 style="margin-bottom: 4px;">${title}</h3>
          <table style="border-collapse: collapse; width: 100%; max-width: 500px; margin-bottom: 16px;">
            ${rows}
          </table>`;
};

const dailyReport = ({ companyName, date, sections }: IDailyReport) => {
  const stats = sections.statisticalSummary;

  return {
    subject: `[GestDoc] Reporte diario — ${companyName} — ${date}`,
    body: `<h1>Reporte diario</h1>
              <p><strong>${companyName}</strong> — ${date}</p>
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
              </table>
              <hr>
              ${renderSection(
                `Empleados de licencia hoy (${sections.employeesOnLeaveToday.totalCount})`,
                sections.employeesOnLeaveToday.items.map(
                  (item) =>
                    `${item.employeeName} — ${item.licenseType} (${item.startDate} al ${item.endDate}, reintegro ${item.returnDate})`,
                ),
              )}
              ${renderSection(
                `Licencias pendientes de aprobación (${sections.pendingLicenses.totalCount})`,
                sections.pendingLicenses.items.map(
                  (item) =>
                    `${item.employeeName} — ${item.licenseType} (desde ${item.startDate}, ${item.daysSinceRequest} días)`,
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
              ${renderSection(
                `Vacaciones próximas (${sections.upcomingVacations.totalCount})`,
                sections.upcomingVacations.items.map(
                  (item) =>
                    `${item.employeeName}${item.segmentName ? ` (${item.segmentName})` : ''} — ${item.startDate} al ${item.endDate}`,
                ),
              )}
              ${renderSection(
                `Licencias que vencen esta semana (${sections.expiringLicenses.totalCount})`,
                sections.expiringLicenses.items.map(
                  (item) =>
                    `${item.employeeName} — ${item.licenseType} (hasta ${item.endDate})`,
                ),
              )}
              <hr>
              <p>Este mail fue enviado de forma automática por <strong><a href="https://docs.macrosistemas.ar/" target="_blank" rel="nofollow">GestDoc</a></strong></p>
              `,
  };
};

export const emailTemplates = {
  addLicense,
  licenseStatusChange,
  documentSignedAdmin,
  documentSignedEmployee,
  disclaimerReminder,
  dailyReport,
};
