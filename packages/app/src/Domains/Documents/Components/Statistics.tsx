import { Container, PieChartComponent } from '@app/Application/Components';
import { Card } from '@app/Application/Components/ui/card';
import { CheckCircle2, Clock, FileText } from 'lucide-react';
import { StatCard } from './StatCard';
import { useGetStatisticsDocuments } from '../Hooks';

export const Statistics = () => {
  const { dataChart, data: statistics } = useGetStatisticsDocuments();

  return (
    <Card>
      <Container className="md:flex-row justify-around items-center">
        <PieChartComponent
          chartData={dataChart}
          total={statistics?.total || 0}
          header={{
            title: 'Estado de todos los documentos',
            subtitle: 'Documentos hasta la actualidad',
          }}
          footer={{
            title: 'Puedes utilizar los filtros para más detalles',
          }}
          labelCenter="Documentos"
        />

        <Container className="flex-1" justify="center">
          <div className="grid grid-cols-2 auto-rows-fr gap-3 p-4 w-full">
            <StatCard
              icon={<FileText size={20} />}
              label="Total de documentos"
              value={statistics?.total}
              colorClass="text-blue-600"
              bgClass="bg-blue-50 dark:bg-blue-950/30"
              progressColor="bg-blue-600"
            />
            <StatCard
              icon={<Clock size={20} />}
              label="Documentos pendientes"
              value={statistics?.pending}
              total={statistics?.total}
              colorClass="text-amber-600"
              bgClass="bg-amber-50 dark:bg-amber-950/30"
              progressColor="bg-amber-500"
            />
            <div className="col-span-2">
              <StatCard
                icon={<CheckCircle2 size={20} />}
                label="Documentos validados"
                value={statistics?.validated}
                total={statistics?.total}
                colorClass="text-emerald-600"
                bgClass="bg-emerald-50 dark:bg-emerald-950/30"
                progressColor="bg-emerald-500"
              />
            </div>
          </div>
        </Container>
      </Container>
    </Card>
  );
};
