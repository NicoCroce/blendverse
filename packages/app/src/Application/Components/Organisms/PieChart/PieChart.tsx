'use client';

import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';

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
import { cn } from '@/Application/lib/utils';
import { Text } from '../../Molecules';
import { Container } from '../../Layout';

export type TDataPieChart = {
  segment: string;
  data: number | string;
  fill?: string;
};

const PRIMARY_OPACITY_SCALE = [1, 0.82, 0.64, 0.46, 0.88, 0.7, 0.52, 0.34];

const getPrimaryChartColor = (index: number) => {
  const opacity = PRIMARY_OPACITY_SCALE[index % PRIMARY_OPACITY_SCALE.length];

  return opacity === 1
    ? 'hsl(var(--primary))'
    : `hsl(var(--primary) / ${opacity})`;
};

const buildChartConfig = (chartData: Pick<TDataPieChart, 'segment'>[]) =>
  chartData.reduce<ChartConfig>((config, { segment }, index) => {
    config[segment] = {
      label: segment,
      color: getPrimaryChartColor(index),
    };

    return config;
  }, {});

type TText = {
  title?: string;
  subtitle?: string;
};

interface PieChartComponentProps {
  chartData: TDataPieChart[];
  total: number;
  header?: TText;
  footer?: TText;
  labelCenter?: string;
  className?: string;
}

export const PieChartComponent = ({
  chartData,
  total,
  header,
  footer,
  labelCenter,
  className,
}: PieChartComponentProps) => {
  const chartConfig = useMemo(() => buildChartConfig(chartData), [chartData]);

  const chartDataWithColors = useMemo(
    () =>
      chartData.map((item, index) => ({
        ...item,
        fill: getPrimaryChartColor(index),
      })),
    [chartData],
  );

  return (
    <Card
      className={cn('border-0 shadow-none flex flex-col w-[40%]', className)}
    >
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
            className="mx-auto aspect-square max-h-62.5"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartDataWithColors}
                dataKey="data"
                nameKey="segment"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {total.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            {labelCenter && labelCenter}
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
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
