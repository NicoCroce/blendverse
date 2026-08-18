import { Container, Text } from '@app/Application';
import {
  EMAIL_ROUTE_PRESENTATION,
  TCompanyEmailCode,
} from '../CompanyEmailSettings.entity';

interface DeliveryRouteRailProps {
  delivery: readonly { code: TCompanyEmailCode; enabled: boolean }[];
  onToggle: (code: TCompanyEmailCode, enabled: boolean) => void;
}

const audienceOrder = ['admin', 'employee', 'requester'] as const;

export const DeliveryRouteRail = ({
  delivery,
  onToggle,
}: DeliveryRouteRailProps) => (
  <section
    className="ces-panel p-4 md:p-6"
    aria-labelledby="delivery-routes-title"
  >
    <Container space="small">
      <Container row justify="between" align="end" space="small">
        <Container space="small">
          <span className="ces-utility ces-status-on text-[11px]">
            01 · Rutas de entrega
          </span>
          <h2
            id="delivery-routes-title"
            className="ces-display text-xl font-semibold"
          >
            Cada línea representa una comunicación real
          </h2>
        </Container>
        <span className="ces-utility ces-muted hidden text-[10px] md:inline">
          Origen → destino → estado
        </span>
      </Container>

      {audienceOrder.map((audience) => {
        const routes = delivery.filter((item) =>
          EMAIL_ROUTE_PRESENTATION[item.code].audienceLabel
            .toLowerCase()
            .startsWith(
              audience === 'admin'
                ? 'admin'
                : audience === 'employee'
                  ? 'emple'
                  : 'solic',
            ),
        );
        if (routes.length === 0) return null;

        return (
          <Container
            key={audience}
            className="border-t border-white/10 pt-4"
            space="small"
          >
            <span className="ces-utility ces-muted text-[10px]">
              {audience === 'admin'
                ? 'Administradores'
                : audience === 'employee'
                  ? 'Empleados'
                  : 'Solicitante'}
            </span>
            {routes.map((item) => {
              const route = EMAIL_ROUTE_PRESENTATION[item.code];
              return (
                <article key={item.code} className="ces-inset p-3 md:p-4">
                  <Container
                    className="gap-3 md:grid md:grid-cols-[minmax(10rem,1fr)_minmax(8rem,1fr)_auto] md:items-center"
                    space="small"
                  >
                    <Container space="none">
                      <span className="text-sm font-semibold text-[var(--ces-ice-100)]">
                        {route.label}
                      </span>
                      <span className="ces-muted text-xs">
                        {route.description}
                      </span>
                    </Container>
                    <Container
                      row
                      align="center"
                      space="small"
                      className="min-w-0"
                    >
                      <span className="max-w-28 truncate text-xs text-[var(--ces-ice-100)]">
                        {route.source}
                      </span>
                      <span
                        className="ces-route-line min-w-8 flex-1"
                        data-active={item.enabled}
                        aria-hidden="true"
                      />
                      <span className="max-w-36 truncate text-xs text-[var(--ces-ice-100)]">
                        {route.destination}
                      </span>
                    </Container>
                    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg border border-white/10 px-3 text-xs md:min-w-28">
                      <span
                        className={
                          item.enabled ? 'ces-status-on' : 'ces-status-off'
                        }
                      >
                        {item.enabled ? 'Activo' : 'Inactivo'}
                      </span>
                      <input
                        type="checkbox"
                        className="ces-toggle h-4 w-4"
                        checked={item.enabled}
                        onChange={(event) =>
                          onToggle(item.code, event.target.checked)
                        }
                        aria-label={`${route.label}: ${item.enabled ? 'Activo' : 'Inactivo'}`}
                      />
                    </label>
                  </Container>
                  <Text.Muted className="ces-utility mt-3 text-[10px]">
                    {route.triggerLabel}
                  </Text.Muted>
                </article>
              );
            })}
          </Container>
        );
      })}
    </Container>
  </section>
);
