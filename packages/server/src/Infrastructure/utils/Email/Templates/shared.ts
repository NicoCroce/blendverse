/**
 * Helpers compartidos por los templates de email.
 */

/** Pie de página estándar de todos los mails. */
export const emailFooter = `<hr>
<p>Este mail fue enviado de forma automática por <strong><a href="https://docs.macrosistemas.ar/" target="_blank" rel="nofollow">GestDoc</a></strong></p>`;

/**
 * Convierte una fecha ISO `YYYY-MM-DD` a formato `DD/MM/YYYY` para los mails.
 * Si el input no tiene el formato esperado, lo devuelve sin cambios.
 */
export const formatDateEs = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
};

/**
 * Renderiza una sección como tabla HTML. Si no hay items y `showWhenEmpty`
 * es false, devuelve string vacío (la sección se omite). Si hay items o
 * `showWhenEmpty` es true, siempre renderiza el título de la sección.
 */
export const renderSection = (
  title: string,
  items: string[],
  showWhenEmpty = false,
): string => {
  if (items.length === 0) {
    if (!showWhenEmpty) return '';
    return `<h3 style="margin-bottom: 4px;">${title}</h3>
            <p style="color: #6B7280; margin: 0 0 16px;">No existen coincidencias en este período.</p>`;
  }

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
