import { useMemo } from 'react';
import { Badge } from '@app/Application/Components/ui/badge';
import { Skeleton } from '@app/Application/Components/ui/skeleton';
import { Button } from '@app/Application';
import { DataTable } from '@app/Application/Components/Organisms/DataCollection/DataTable';
import { useGetUserSegments } from '../../Application/segments.queries';
import { UserSegmentsEmptyState } from './UserSegmentsEmptyState';
import type { Employee } from './types';
import type { ColumnDef, CellContext } from '@tanstack/react-table';
import type { IPaginationPages } from '@app/Application/Helpers';

const SegmentBadgesCell = ({ userId }: { userId: number }) => {
  const { data: userSegments, isLoading: segsLoading } = useGetUserSegments({
    userId,
  });

  if (segsLoading) {
    return (
      <div className="flex gap-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    );
  }

  if (userSegments && userSegments.length > 0) {
    return (
      <div className="flex flex-wrap gap-1">
        {userSegments.map((seg) => (
          <Badge key={seg.id} variant="secondary" className="text-xs">
            {seg.nombre}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <span className="text-xs text-muted-foreground italic">Sin segmentos</span>
  );
};

const EmployeeCell = ({ row }: CellContext<Employee, unknown>) => (
  <div className="flex items-center gap-3">
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
      {row.original.nombre.charAt(0).toUpperCase()}
      {row.original.apellido.charAt(0).toUpperCase()}
    </div>
    <div className="min-w-0">
      <p className="truncate font-medium text-sm">
        {row.original.nombre} {row.original.apellido}
      </p>
      <p className="truncate text-xs text-muted-foreground md:hidden">
        {row.original.email}
      </p>
    </div>
  </div>
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
  isLoading,
  paginationMeta,
  onSelectUser,
  hasSearch,
  searchTerm,
  hasSegmentFilter,
  withoutSegments,
}: {
  employees: Employee[];
  isLoading: boolean;
  paginationMeta: IPaginationPages;
  onSelectUser: (employee: Employee) => void;
  hasSearch: boolean;
  searchTerm: string;
  hasSegmentFilter: boolean;
  withoutSegments: boolean;
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

  if (isLoading) return <DataTable.Skeleton />;

  if (employees.length > 0) {
    return (
      <DataTable
        columns={columns}
        data={employees}
        pagination={paginationMeta}
      />
    );
  }

  return (
    <UserSegmentsEmptyState
      hasSearch={hasSearch}
      searchTerm={searchTerm}
      hasSegmentFilter={hasSegmentFilter}
      withoutSegments={withoutSegments}
    />
  );
};
