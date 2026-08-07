import { emailFooter, formatDateEs, renderSection } from './shared';
import type { IEmployeeDailyReminder } from './types';

/**
 * Template del email diario de pendientes del empleado.
 * Renderiza únicamente las secciones que tienen pendientes (FR-008):
 * sin pendientes la sección se omite. Reutiliza renderSection/emailFooter.
 */
export const employeeDailyReminder = ({
  employeeName,
  companyName,
  date,
  pending,
}: IEmployeeDailyReminder) => {
  const sections: string[] = [];

  if (pending.unsignedDocuments.length > 0) {
    sections.push(
      renderSection(
        `Documentos sin firmar (${pending.unsignedDocuments.length})`,
        pending.unsignedDocuments.map((document) => document.documentTitle),
      ),
    );
  }

  if (pending.unviewedDocuments.length > 0) {
    sections.push(
      renderSection(
        `Documentos sin visualizar (${pending.unviewedDocuments.length})`,
        pending.unviewedDocuments.map((document) => document.documentTitle),
      ),
    );
  }

  if (pending.pendingDisclaimerAcceptance) {
    sections.push(
      renderSection('Términos y condiciones sin aceptar', [
        'Aceptá los términos y condiciones de tu empresa',
      ]),
    );
  }

  if (pending.renewPassword) {
    sections.push(
      renderSection('Renovar contraseña', [
        'Actualizá tu contraseña por seguridad',
      ]),
    );
  }

  return {
    subject: `[GestDoc] Tus pendientes — ${companyName} — ${formatDateEs(date)}`,
    body: `<h1>Hola ${employeeName}</h1>
            <p>Estos son tus pendientes de hoy:</p>
            ${sections.join('\n')}
            ${emailFooter}`,
  };
};
