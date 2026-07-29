import { Card, CardContent } from '@app/Application/Components/ui/card';
import { useGetStatisticsEmpleados } from '../Hooks/useGetStatisticsEmpleados';
import { cn } from '@app/Application/lib/utils';

const StatCard = ({
  label,
  value,
  className,
  children,
}: {
  label: string;
  value: string | number;
  className?: string;
  children?: React.ReactNode;
}) => (
  <Card className={cn('border shadow-sm', className)}>
    <CardContent className="p-5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
      {children && <div className="mt-3">{children}</div>}
    </CardContent>
  </Card>
);

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
      <StatCard label="Empleados" value={total} />

      <StatCard
        label="Renovar clave"
        value={necesitaRenovar}
        className={cn(
          necesitaRenovar > 0
            ? 'border-l-4 border-l-destructive'
            : 'border-l-4 border-l-green-500',
        )}
      >
        <div className="flex items-center gap-4 text-xs">
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
        </div>
      </StatCard>

      <StatCard
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
        <div className="flex items-center gap-3 text-xs flex-wrap">
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
        </div>
      </StatCard>
    </div>
  );
};
