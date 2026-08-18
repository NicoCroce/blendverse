'use client';

import { TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/Application/Components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/Application/Components/ui/chart';
import { Container } from '../../Layout';
import { Text } from '../../Molecules';

type TText = {
  title?: string;
  subtitle?: string;
};

export type TDataAreaChart = {
  month: string;
  count: number;
};

const chartConfig = {
  count: {
    label: 'Licencias',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

interface AreaChartComponentProps {
  chartData: TDataAreaChart[];
  header?: TText;
  footer?: TText;
  tooltipContent?: React.ReactElement;
}

export const AreaChartComponent = ({
  chartData,
  header,
  footer,
  tooltipContent,
}: AreaChartComponentProps) => {
  return (
    <Card className="border-0 shadow-none flex flex-col w-full">
      {header && (
        <CardHeader className="items-center pb-0">
          {header.title && <CardTitle>{header.title}</CardTitle>}
          {header.subtitle && (
            <CardDescription>{header.subtitle}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className="flex-1 pb-0">
        {chartData.length !== 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-auto h-[250px] w-full"
          >
            <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
              <defs>
                <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-count)"
                    stopOpacity={0.85}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-count)"
                    stopOpacity={0.15}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <ChartTooltip
                cursor={false}
                content={
                  tooltipContent || <ChartTooltipContent indicator="line" />
                }
              />
              <Area
                dataKey="count"
                name="Licencias"
                type="monotone"
                stroke="var(--color-count)"
                strokeWidth={2}
                fill="url(#fillCount)"
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <Container
            justify="center"
            align="center"
            className="h-full min-h-32"
          >
            <Text.Muted>Sin datos</Text.Muted>
          </Container>
        )}
      </CardContent>
      {footer && (
        <CardFooter className="flex-col gap-2 text-sm">
          {footer.title && (
            <div className="flex items-center gap-2 font-medium leading-none">
              {footer.title} <TrendingUp className="h-4 w-4" />
            </div>
          )}
          {footer.subtitle && (
            <div className="leading-none text-muted-foreground">
              {footer.subtitle}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
};
