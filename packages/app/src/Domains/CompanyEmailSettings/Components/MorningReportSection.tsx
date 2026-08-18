import { Container, Text } from '@app/Application';
import {
  REPORT_SECTION_PRESENTATION,
  TCompanyReportSectionCode,
} from '../CompanyEmailSettings.entity';

interface MorningReportSectionProps {
  sections: readonly { code: TCompanyReportSectionCode; enabled: boolean }[];
  reportEnabled: boolean;
  validationError?: string;
  onToggle: (code: TCompanyReportSectionCode, enabled: boolean) => void;
}

export const MorningReportSection = ({
  sections,
  reportEnabled,
  validationError,
  onToggle,
}: MorningReportSectionProps) => (
  <section
    className="ces-panel p-4 md:p-6"
    aria-labelledby="morning-report-title"
  >
    <Container space="medium">
      <Container space="small">
        <span className="ces-utility ces-status-on text-[11px]">
          03 · Reporte de la mañana
        </span>
        <h2
          id="morning-report-title"
          className="ces-display text-xl font-semibold"
        >
          Elige qué debe llegar a las 09:00
        </h2>
        <Text.Muted className="ces-muted">
          El horario se mantiene fijo. Solo se consultarán y mostrarán las
          secciones seleccionadas.
        </Text.Muted>
      </Container>
      {!reportEnabled && (
        <Container className="ces-inset p-3" row align="start" space="small">
          <span className="ces-utility ces-muted text-[10px]">
            Reporte inactivo
          </span>
          <Text.Muted className="ces-muted text-xs">
            La selección queda guardada para cuando vuelvas a activarlo.
          </Text.Muted>
        </Container>
      )}
      <Container className="grid gap-3 md:grid-cols-2" space="small">
        {sections.map((section) => {
          const presentation = REPORT_SECTION_PRESENTATION[section.code];
          return (
            <label
              key={section.code}
              className="ces-inset flex min-h-20 cursor-pointer items-start gap-3 p-3"
            >
              <input
                type="checkbox"
                checked={section.enabled}
                onChange={(event) =>
                  onToggle(section.code, event.target.checked)
                }
                className="ces-toggle mt-1 h-4 w-4"
                aria-label={`${presentation.label}: ${section.enabled ? 'Incluida' : 'Excluida'}`}
              />
              <Container space="none">
                <span className="text-sm font-semibold text-[var(--ces-ice-100)]">
                  {presentation.label}
                </span>
                <span className="ces-muted text-xs leading-5">
                  {presentation.description}
                </span>
              </Container>
            </label>
          );
        })}
      </Container>
      <span className="ces-utility ces-muted text-[10px]">
        {sections.filter((section) => section.enabled).length} secciones
        incluidas en el próximo reporte
      </span>
      {validationError && (
        <span className="text-sm text-[var(--ces-amber-400)]" role="alert">
          {validationError}
        </span>
      )}
    </Container>
  </section>
);
