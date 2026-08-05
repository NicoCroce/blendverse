import { Container } from '@app/Application';
import { useGetStatisticsEmpleados } from '../Hooks/useGetStatisticsEmpleados';
import { cn } from '@app/Application/lib/utils';
import { EmpleadosStatCard } from './EmpleadosStatCard';

export const StatisticsEmpleados = () => {
  const { total, dataChartRenovacionClave, dataChartEstadoFirma } =
    useGetStatisticsEmpleados();

  const necesitaRenovar = Number(
    dataChartRenovacionClave.find((d) => d.segment === 'Debe renovar')?.data ??
      0,
  );
  const okRenovar = total - necesitaRenovar;
  const firmados = Number(
    dataChartEstadoFirma.find((d) => d.segment === 'Firmado')?.data ?? 0,
  );
  const pendientes = Number(
    dataChartEstadoFirma.find((d) => d.segment === 'Pendiente')?.data ?? 0,
  );
  const corruptos = Number(
    dataChartEstadoFirma.find((d) => d.segment === 'Corrupto')?.data ?? 0,
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <EmpleadosStatCard label="Empleados" value={total} />

      <EmpleadosStatCard
        label="Renovar clave"
        value={necesitaRenovar}
        className={cn(
          necesitaRenovar > 0
            ? 'border-l-4 border-l-destructive'
            : 'border-l-4 border-l-green-500',
        )}
      >
        <Container row align="center" space="medium" className="text-xs">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">{okRenovar} OK</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-destructive" />
            <span className="text-muted-foreground">
              {necesitaRenovar} pendientes
            </span>
          </span>
        </Container>
      </EmpleadosStatCard>

      <EmpleadosStatCard
        label="Aceptación de términos"
        value={`${firmados} firmados`}
        className={cn(
          corruptos > 0
            ? 'border-l-4 border-l-destructive'
            : pendientes > 0
              ? 'border-l-4 border-l-amber-500'
              : 'border-l-4 border-l-green-500',
        )}
      >
        <Container row align="center" className="gap-3 text-xs flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">{firmados} firmados</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">{pendientes} pend.</span>
          </span>
          {corruptos > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-destructive" />
              <span className="text-muted-foreground">
                {corruptos} corruptos
              </span>
            </span>
          )}
        </Container>
      </EmpleadosStatCard>
    </div>
  );
};
