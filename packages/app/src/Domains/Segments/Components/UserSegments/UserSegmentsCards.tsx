import { Button, Container } from '@app/Application';
import { Badge } from '@app/Application/Components/ui/badge';
import { Skeleton } from '@app/Application/Components/ui/skeleton';
import { useGetUserSegments } from '../../Hooks/useGetUserSegments';
import type { Employee } from './types';

const MAX_VISIBLE_BADGES = 4;

const UserSegmentBadges = ({ userId }: { userId: number }) => {
  const { data: userSegments, isLoading } = useGetUserSegments({ userId });

  if (isLoading) {
    return (
      <Container row className="gap-1 flex-wrap">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </Container>
    );
  }

  if (!userSegments || userSegments.length === 0) {
    return (
      <span className="text-xs text-muted-foreground italic truncate">
        Sin segmentos
      </span>
    );
  }

  const visible = userSegments.slice(0, MAX_VISIBLE_BADGES);
  const overflow = userSegments.length - MAX_VISIBLE_BADGES;

  return (
    <Container row className="gap-1 flex-wrap">
      {visible.map((seg) => (
        <Badge key={seg.id} variant="secondary" className="text-xs">
          {seg.nombre}
        </Badge>
      ))}
      {overflow > 0 && (
        <Badge variant="outline" className="text-xs">
          +{overflow} más
        </Badge>
      )}
    </Container>
  );
};

export const UserSegmentsCards = ({
  employees,
  onSelectUser,
}: {
  employees: Employee[];
  onSelectUser: (employee: Employee) => void;
}) => (
  <Container space="small">
    {employees.map((employee) => (
      <Container
        key={employee.id}
        className="rounded-lg border bg-card p-4"
        space="small"
      >
        <Container row align="center" className="gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {employee.nombre.charAt(0).toUpperCase()}
            {employee.apellido.charAt(0).toUpperCase()}
          </div>
          <Container className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {employee.nombre} {employee.apellido}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {employee.email}
            </p>
          </Container>
        </Container>

        <Container row align="center" justify="between" className="gap-2">
          <div className="min-w-0 flex-1">
            <UserSegmentBadges userId={employee.id} />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSelectUser(employee)}
            className="shrink-0 text-xs"
          >
            Asignar
          </Button>
        </Container>
      </Container>
    ))}
  </Container>
);

export const UserSegmentsCardsSkeleton = () => (
  <Container space="small">
    {Array.from({ length: 5 }).map((_, i) => (
      <Container
        key={i}
        className="rounded-lg border bg-card p-4"
        space="small"
      >
        <Container row align="center" className="gap-3">
          <Skeleton className="size-9 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </div>
        </Container>
        <Container row align="center" justify="between" className="gap-2">
          <div className="flex-1">
            <Container row className="gap-1">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </Container>
          </div>
          <Skeleton className="h-8 w-16 rounded-md shrink-0" />
        </Container>
      </Container>
    ))}
  </Container>
);
