import { Container, PieChartComponent } from '@app/Application/Components';
import { Card } from '@app/Application/Components/ui/card';
import { useGetStatisticsCertificates } from '../Hooks';

export const StatisticsCertificates = () => {
  const {
    dataChartTotalActivas,
    data: statistics,
    dataChartTypes,
    dataChartEmployess,
    dataChartStatus,
  } = useGetStatisticsCertificates();

  return (
    <Card>
      <Container row className="overflow-x-auto md:justify-between">
        <PieChartComponent
          className="min-w-75 shrink-0"
          chartData={dataChartTotalActivas}
          total={statistics?.actives || 0}
          header={{
            title: 'Cantidad de licencias activas',
          }}
          footer={{
            title: 'Puedes utilizar los filtros para más detalles',
          }}
          labelCenter="Certificados"
        />
        <PieChartComponent
          className="min-w-75 shrink-0"
          chartData={dataChartTypes}
          total={dataChartTypes.length || 0}
          header={{
            title: 'Cantidad de licencias por tipo',
          }}
          footer={{
            title: 'Puedes utilizar los filtros para más detalles',
          }}
          labelCenter="Tipos"
        />
        <PieChartComponent
          className="min-w-75 shrink-0"
          chartData={dataChartEmployess}
          total={dataChartEmployess.length || 0}
          header={{
            title: 'Empleados con licencias',
          }}
          footer={{
            title: 'Puedes utilizar los filtros para más detalles',
          }}
          labelCenter="Empleado/s"
        />
        <PieChartComponent
          className="min-w-75 shrink-0"
          chartData={dataChartStatus}
          total={
            dataChartStatus.reduce((acc, curr) => acc + Number(curr.data), 0) ||
            0
          }
          header={{
            title: 'Cantidad de certificados por estado',
          }}
          footer={{
            title: 'Distribución por estado',
          }}
          labelCenter="Total"
        />
      </Container>
    </Card>
  );
};
