import { TDataPieChart } from '@app/Application/Components/Organisms/PieChart/PieChart';
import { DocumentsService } from '../Documents.service';

export const useGetStatisticsDocuments = () => {
  const response = DocumentsService.getStatistics.useQuery();

  const dataChart: TDataPieChart[] = [
    {
      segment: 'validados',
      data: response.data?.validated || 0,
      fill: 'hsl(var(--chart-1))',
    },
    {
      segment: 'pendientes',
      data: response.data?.pending || 0,
      fill: 'hsl(var(--chart-2))',
    },
  ];

  return {
    dataChart,
    ...response,
  };
};
