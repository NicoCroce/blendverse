import { useMemo } from 'react';
import { TDataPieChart } from '@app/Application/Components/Organisms/PieChart/PieChart';
import { useGetEmployees } from '@app/Domains/Disclaimer/hooks/useDisclaimer';
import { IEmployeeRecord } from '../Empleados/columns';

const firmColors: Record<string, string> = {
  Firmado: 'hsl(142, 71%, 45%)', // verde
  Pendiente: 'hsl(45, 93%, 58%)', // ámbar
  Corrupto: 'hsl(0, 84%, 60%)', // rojo
};

export const useGetStatisticsEmpleados = () => {
  const { data: paginated, isLoading } = useGetEmployees()(
    { search: '' },
    { refetchOnMount: 'always' },
  );

  const employees = paginated?.data ?? [];
  const total = employees.length;

  const dataChartRenovacionClave: TDataPieChart[] = useMemo(() => {
    const necesita = employees.filter((e) => e.renovar_clave).length;
    const ok = total - necesita;

    return [
      {
        segment: 'Debe renovar',
        data: necesita,
        fill: 'hsl(0, 84%, 60%)',
      },
      {
        segment: 'OK',
        data: ok,
        fill: 'hsl(142, 71%, 45%)',
      },
    ];
  }, [employees, total]);

  const dataChartEstadoFirma: TDataPieChart[] = useMemo(() => {
    const counts = new Map<IEmployeeRecord['estado_firma'], number>();

    for (const e of employees) {
      counts.set(e.estado_firma, (counts.get(e.estado_firma) || 0) + 1);
    }

    return Array.from(counts.entries()).map(([estado, count]) => ({
      segment: estado,
      data: count,
      fill: firmColors[estado] || 'hsl(0, 0%, 50%)',
    }));
  }, [employees]);

  const dataChartTotal: TDataPieChart[] = useMemo(
    () => [
      {
        segment: 'empleados',
        data: total,
        fill: 'hsl(var(--chart-1))',
      },
    ],
    [total],
  );

  return {
    total,
    dataChartTotal,
    dataChartRenovacionClave,
    dataChartEstadoFirma,
    isLoading,
  };
};
