import { TDataPieChart } from '@app/Application/Components/Organisms/PieChart/PieChart';
import { CertificatesService } from '@app/Domains/Certificates';

const statusColors: Record<string, string> = {
  pendiente: 'hsl(45, 93%, 58%)', // amarillo
  validando: 'hsl(217, 91%, 60%)', // azul
  aprobado: 'hsl(142, 71%, 45%)', // verde
  rechazado: 'hsl(0, 84%, 60%)', // rojo
  eliminado: 'hsl(0, 0%, 60%)', // gris
};

export const useGetStatisticsCertificates = () => {
  const response = CertificatesService.getStatistics.useQuery();

  const dataChartTotalActivas: TDataPieChart[] = [
    {
      segment: 'activas',
      data: response.data?.actives || 0,
      fill: 'hsl(var(--chart-1))',
    },
    {
      segment: 'total',
      data: response.data?.total || 0,
      fill: 'hsl(var(--chart-2))',
    },
  ];

  const dataChartTypes: TDataPieChart[] =
    response.data?.types.map(({ name, count }, index) => {
      return {
        segment: name,
        data: count || 0,
        fill: `hsl(${(index * 20) % 320}, 70%, 50%)`,
      };
    }) || [];

  const dataChartEmployess: TDataPieChart[] =
    response.data?.employees.map(({ user, count }, index) => {
      return {
        segment: user,
        data: count || 0,
        fill: `hsl(${(index * 20) % 320}, 70%, 50%)`,
      };
    }) || [];

  const dataChartStatus: TDataPieChart[] =
    response.data?.status.map(({ status, count }) => {
      return {
        segment: status,
        data: count || 0,
        fill: statusColors[status] || 'hsl(0, 0%, 50%)',
      };
    }) || [];

  return {
    dataChartTotalActivas,
    dataChartEmployess,
    dataChartTypes,
    dataChartStatus,
    ...response,
  };
};
