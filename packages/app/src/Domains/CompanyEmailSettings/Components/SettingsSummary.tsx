import {
  faCircleExclamation,
  faCircleInfo,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Container, Text } from '@app/Application';
import type { TCompanyEmailSettings } from '../CompanyEmailSettings.entity';

interface SettingsSummaryProps {
  snapshot: TCompanyEmailSettings;
  activeDeliveryCount: number;
  recipientCount: number;
  activeReportCount: number;
  compact?: boolean;
}

export const SettingsSummary = ({
  snapshot,
  activeDeliveryCount,
  recipientCount,
  activeReportCount,
  compact = false,
}: SettingsSummaryProps) => {
  const diagnostics = snapshot.diagnostics;
  const hasRisk = diagnostics.length > 0 || recipientCount === 0;

  return (
    <section
      className={`ces-panel p-4 ${compact ? 'space-y-4' : 'h-fit p-6'}`}
      aria-labelledby="settings-summary-title"
    >
      <Container row justify="between" align="start" space="small">
        <Container space="small">
          <span className="ces-utility ces-muted text-[11px]">
            Estado de la red
          </span>
          <h2
            id="settings-summary-title"
            className="ces-display text-2xl font-semibold"
          >
            {activeDeliveryCount.toString().padStart(2, '0')} / 09
          </h2>
          <Text.Muted className="ces-muted">rutas activas</Text.Muted>
        </Container>
        <span
          className={hasRisk ? 'ces-risk' : 'ces-status-on'}
          aria-label={hasRisk ? 'Requiere atención' : 'Operación estable'}
        >
          <FontAwesomeIcon
            icon={hasRisk ? faCircleExclamation : faCircleInfo}
          />
        </span>
      </Container>

      <Container className="border-t border-white/10 pt-4" space="small">
        <Container row justify="between" align="center" space="small">
          <span className="ces-muted text-sm">
            Destinatarios administrativos
          </span>
          <span className="ces-utility text-xs text-[var(--ces-ice-100)]">
            {recipientCount.toString().padStart(2, '0')}
          </span>
        </Container>
        <Container row justify="between" align="center" space="small">
          <span className="ces-muted text-sm">Secciones del reporte</span>
          <span className="ces-utility text-xs text-[var(--ces-ice-100)]">
            {activeReportCount.toString().padStart(2, '0')} / 07
          </span>
        </Container>
        <Container row justify="between" align="center" space="small">
          <span className="ces-muted text-sm">Versión de configuración</span>
          <span className="ces-utility text-xs text-[var(--ces-ice-100)]">
            v{snapshot.version}
          </span>
        </Container>
      </Container>

      {hasRisk && (
        <Container
          className="ces-risk-surface rounded-lg p-3"
          row
          align="start"
          space="small"
        >
          <FontAwesomeIcon
            icon={faCircleExclamation}
            className="ces-risk mt-0.5"
          />
          <Text.Muted className="ces-risk text-xs leading-5">
            {diagnostics[0] ??
              'No hay destinatarios administrativos configurados.'}
          </Text.Muted>
        </Container>
      )}

      <Container className="border-t border-white/10 pt-3" space="none">
        <span className="ces-utility ces-muted text-[10px]">
          Última actualización
        </span>
        <span className="ces-utility text-xs text-[var(--ces-ice-100)]">
          {new Date(snapshot.updatedAt).toLocaleString()}
        </span>
      </Container>
    </section>
  );
};
