import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@app/Application/Components/ui/card';
import { Container } from '@app/Application';

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | undefined;
  total?: number;
  colorClass: string;
  bgClass: string;
  progressColor: string;
}

export const StatCard = ({
  icon,
  label,
  value,
  total,
  colorClass,
  bgClass,
  progressColor,
}: StatCardProps) => {
  const pct =
    total && value ? Math.min(Math.round((value / total) * 100), 100) : 0;

  return (
    <Card className={`flex-1 border-0 h-full ${bgClass}`}>
      <CardHeader className="pb-2 pt-4 px-4">
        <Container row align="center" justify="between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
          <span className={colorClass}>{icon}</span>
        </Container>
      </CardHeader>
      <CardContent className="pb-4 px-4 space-y-3">
        <span className={`text-3xl font-bold ${colorClass}`}>
          {value ?? '—'}
        </span>
        {total !== undefined && (
          <div className="space-y-1">
            <div className="h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10">
              <div
                className={`h-full rounded-full transition-all ${progressColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{pct}% del total</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
