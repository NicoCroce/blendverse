import { Card, CardContent } from '@app/Application/Components/ui/card';
import { cn } from '@app/Application/lib/utils';

export const EmpleadosStatCard = ({
  label,
  value,
  className,
  children,
}: {
  label: string;
  value: string | number;
  className?: string;
  children?: React.ReactNode;
}) => (
  <Card className={cn('border shadow-sm', className)}>
    <CardContent className="p-5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
      {children && <div className="mt-3">{children}</div>}
    </CardContent>
  </Card>
);
