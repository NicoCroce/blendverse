import { Container } from '@app/Application';
import { cn } from '@app/Application/lib/utils';

export const UserSegmentsStatCard = ({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
}) => (
  <Container
    row
    align="center"
    className={cn('gap-3 rounded-lg border bg-card p-4 shadow-sm', className)}
  >
    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground truncate">{label}</p>
    </div>
  </Container>
);
