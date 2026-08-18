import { useState } from 'react';
import {
  AreaChartComponent,
  TDataAreaChart,
} from '@app/Application/Components';
import { Container } from '@app/Application/Components';
import { Card } from '@app/Application/Components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/Application/Components/ui/select';
import { useGetMonthlyStatisticsCertificates } from '../Hooks';
import { MonthlyLicensesChartTooltip } from './MonthlyLicensesChartTooltip';

export const MonthlyLicensesChart = () => {
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const { dataChart, year, availableYears, isLoading } =
    useGetMonthlyStatisticsCertificates(selectedYear);

  const total = dataChart.reduce((acc, item) => acc + (item.count || 0), 0);

  return (
    <Card>
      <Container>
        <Container
          row
          align="center"
          justify="between"
          space="medium"
          className="flex-col sm:flex-row px-6 pt-6"
        >
          <div>
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Licencias por mes
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Total de licencias durante el año {year}
            </p>
          </div>
          <Select
            value={String(year)}
            onValueChange={(value) => setSelectedYear(Number(value))}
            disabled={isLoading || availableYears.length === 0}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((availableYear) => (
                <SelectItem key={availableYear} value={String(availableYear)}>
                  {availableYear}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Container>
        <AreaChartComponent
          chartData={dataChart as TDataAreaChart[]}
          footer={{
            title: `${total.toLocaleString()} licencias en ${year}`,
            subtitle: 'Distribución mensual de licencias',
          }}
          tooltipContent={<MonthlyLicensesChartTooltip />}
        />
      </Container>
    </Card>
  );
};
