'use client';

import { TrendingUp } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/Aplication/Components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/Aplication/Components/ui/chart';

const chartConfig = {
  data: {
    label: 'data',
  },
  chrome: {
    label: 'Chrome',
    color: 'hsl(var(--chart-1))',
  },
  safari: {
    label: 'Safari',
    color: 'hsl(var(--chart-2))',
  },
  firefox: {
    label: 'Firefox',
    color: 'hsl(var(--chart-3))',
  },
  edge: {
    label: 'Edge',
    color: 'hsl(var(--chart-4))',
  },
  other: {
    label: 'Other',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

type TText = {
  title?: string;
  subtitle?: string;
};

export type TDataPieChart = {
  segment: string;
  data: number | string;
  fill: string;
};

interface PieChartComponentProps {
  chartData: TDataPieChart[];
  total: number;
  header?: TText;
  footer?: TText;
  labelCenter?: string;
}

export const PieChartComponent = ({
  chartData,
  total,
  header,
  footer,
  labelCenter,
}: PieChartComponentProps) => (
  <Card className="border-0 shadow-none">
    {header && (
      <CardHeader className="items-center pb-0">
        {header.title && <CardTitle>{header.title}</CardTitle>}
        {header.subtitle && (
          <CardDescription>{header.subtitle}</CardDescription>
        )}
      </CardHeader>
    )}
    <CardContent className="flex-1 pb-0">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[250px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
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
