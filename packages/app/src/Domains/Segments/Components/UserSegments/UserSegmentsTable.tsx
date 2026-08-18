import { useMemo } from 'react';
import { Badge } from '@app/Application/Components/ui/badge';
import { Skeleton } from '@app/Application/Components/ui/skeleton';
import { Button, Container } from '@app/Application';
import { DataTable } from '@app/Application/Components/Organisms/DataCollection/DataTable';
import { useGetUserSegments } from '../../Hooks/useGetUserSegments';
import type { Employee } from './types';
import type { ColumnDef, CellContext } from '@tanstack/react-table';
import type { IPaginationPages } from '@app/Application/Helpers';

const SegmentBadgesCell = ({ userId }: { userId: number }) => {
  const { data: userSegments, isLoading: segsLoading } = useGetUserSegments({
    userId,
  });

  if (segsLoading) {
    return (
      <Container row className="gap-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </Container>
    );
  }

  if (userSegments && userSegments.length > 0) {
    return (
      <Container row className="flex-wrap gap-1">
        {userSegments.map((seg) => (
          <Badge key={seg.id} variant="secondary" className="text-xs">
            {seg.nombre}
          </Badge>
        ))}
      </Container>
    );
  }

  return (
    <span className="text-xs text-muted-foreground italic">Sin segmentos</span>
  );
};

const EmployeeCell = ({ row }: CellContext<Employee, unknown>) => (
  <Container row align="center" className="gap-3">
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
      {row.original.nombre.charAt(0).toUpperCase()}
      {row.original.apellido.charAt(0).toUpperCase()}
    </div>
    <div className="min-w-0">
      <p className="truncate font-medium text-sm">
        {row.original.nombre} {row.original.apellido}
      </p>
    </div>
  </Container>
);

const EmailCell = ({ row }: CellContext<Employee, unknown>) => (
  <span className="text-sm text-muted-foreground">{row.original.email}</span>
);

const SegmentsCell = ({ row }: CellContext<Employee, unknown>) => (
  <SegmentBadgesCell userId={row.original.id} />
);

const AccionHeader = () => <span className="sr-only">Acción</span>;

const createAccionCell = (onSelect: (employee: Employee) => void) => {
  const AccionCell = ({ row }: CellContext<Employee, unknown>) => (
    <div className="text-right">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSelect(row.original)}
        className="text-xs"
      >
        Asignar
      </Button>
    </div>
  );
  AccionCell.displayName = 'AccionCell';
  return AccionCell;
};

export const UserSegmentsTable = ({
  employees,
  paginationMeta,
  onSelectUser,
}: {
  employees: Employee[];
  paginationMeta: IPaginationPages;
  onSelectUser: (employee: Employee) => void;
}) => {
  const columns: ColumnDef<Employee>[] = useMemo(
    () => [
      {
        id: 'empleado',
        header: 'Empleado',
        cell: EmployeeCell,
      },
      {
        id: 'email',
        header: 'Email',
        cell: EmailCell,
      },
      {
        id: 'segmentos',
        header: 'Segmentos',
        cell: SegmentsCell,
      },
      {
        id: 'accion',
        header: AccionHeader,
        cell: createAccionCell(onSelectUser),
      },
    ],
    [onSelectUser],
  );

  return (
    <DataTable columns={columns} data={employees} pagination={paginationMeta} />
  );
};
