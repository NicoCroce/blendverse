import { Container } from '@app/Application/Components';
import { TooltipProps } from 'recharts';
import { TMonthlyLicensesData, TMonthlyLicensesByType } from '../Hooks';

type TMonthlyLicensesChartTooltipProps = TooltipProps<number, string> & {
  payload?: Array<{
    payload: TMonthlyLicensesData;
    value: number;
  }>;
};

export const MonthlyLicensesChartTooltip = ({
  active,
  payload,
  label,
}: TMonthlyLicensesChartTooltipProps) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const total = data.count;
  const byType = data.byType || [];

  return (
    <div className="rounded-lg border border-border/50 bg-background p-3 shadow-md">
      <div className="mb-2 border-b border-border pb-2">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-lg font-bold text-primary">{total} licencias</p>
      </div>
      {byType.length > 0 && (
        <div className="space-y-1">
          {byType.map((type: TMonthlyLicensesByType) => (
            <Container
              row
              align="center"
              justify="between"
              space="medium"
              className="text-xs"
              key={type.name}
            >
              <span className="text-muted-foreground">{type.name}</span>
              <span className="font-mono font-medium">{type.count}</span>
            </Container>
          ))}
        </div>
      )}
    </div>
  );
};
