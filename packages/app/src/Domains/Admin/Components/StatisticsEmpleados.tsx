import { Container, PieChartComponent } from '@app/Application/Components';
import { Card } from '@app/Application/Components/ui/card';
import { useGetStatisticsEmpleados } from '../Hooks/useGetStatisticsEmpleados';

export const StatisticsEmpleados = () => {
  const {
    total,
    dataChartTotal,
    dataChartRenovacionClave,
    dataChartEstadoFirma,
  } = useGetStatisticsEmpleados();

  return (
    <Card>
      <Container className="md:flex-row" justify="between">
        <PieChartComponent
          chartData={dataChartTotal}
          total={total}
          header={{
            title: 'Total de empleados',
            subtitle: 'Todos los empleados de la empresa',
          }}
          footer={{
            title: 'Incluye empleados activos e inactivos',
          }}
          labelCenter="Empleados"
        />
        <PieChartComponent
          chartData={dataChartRenovacionClave}
          total={total}
          header={{
            title: 'Renovación de clave',
            subtitle: 'Empleados que deben renovar su contraseña',
          }}
          footer={{
            title:
              'Los que figuran como "Debe renovar" deberán cambiarla al iniciar sesión',
          }}
          labelCenter="Total"
        />
        <PieChartComponent
          chartData={dataChartEstadoFirma}
          total={total}
          header={{
            title: 'Aceptación de términos',
            subtitle: 'Estado de la firma del disclaimer',
          }}
          footer={{
            title: 'Distribución por estado: Pendiente, Firmado o Corrupto',
          }}
          labelCenter="Total"
        />
      </Container>
    </Card>
  );
};
