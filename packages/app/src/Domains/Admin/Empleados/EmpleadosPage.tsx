import { Container, Page, Input } from '@app/Application';
import { DataTable } from '@app/Application/Components/Organisms/DataCollection/DataTable';
import { DataTablePagination } from '@app/Application/Components/Organisms/DataCollection/DataTablePagination';
import { Button } from '@app/Application/Components';
import { Skeleton } from '@app/Application/Components/ui/skeleton';
import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { StatisticsEmpleados } from '@app/Domains/Admin/Components/StatisticsEmpleados';
import { EmployeeCards } from './EmployeeCards';
import { useEmpleadosPage } from './useEmpleadosPage';

const TableSkeleton = () => (
  <div className="rounded-md border divide-y">
    <div className="p-4">
      <Skeleton className="h-4 w-3/4" />
    </div>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="p-4 flex gap-4">
        <Skeleton className="size-4 rounded-sm shrink-0" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
    ))}
  </div>
);

const CardsSkeleton = () => (
  <div className="flex flex-col gap-2 md:hidden">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-start gap-3 rounded-md border p-3">
        <Skeleton className="size-5 rounded-sm shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ search }: { search: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
      <MagnifyingGlassIcon className="size-6 text-muted-foreground" />
    </div>
    <p className="text-base font-medium">
      {search ? `Sin resultados para «${search}»` : 'No hay empleados'}
    </p>
    <p className="text-sm text-muted-foreground mt-1">
      {search
        ? 'Probá con otro término de búsqueda'
        : 'Todavía no hay empleados en el sistema'}
    </p>
  </div>
);

export const EmpleadosPage = () => {
  const {
    search,
    handleSearch,
    selectionMode,
    handleActivateSelection,
    handleCancelSelection,
    handleConfirmReminders,
    handleToggleSelection,
    sendReminders,
    selectedIds,
    employees,
    paginationMeta,
    columns,
    isLoading,
  } = useEmpleadosPage();

  return (
    <Page title="Empleados">
      <StatisticsEmpleados />

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por nombre, apellido o email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <Cross2Icon className="size-4" />
            </button>
          )}
        </div>
        {!selectionMode ? (
          <Button variant="outline" onClick={handleActivateSelection}>
            Enviar recordatorios
          </Button>
        ) : (
          <Container row space="small" className="flex-wrap">
            <Button
              variant="outline"
              onClick={handleConfirmReminders}
              disabled={sendReminders.isPending || selectedIds.size === 0}
              isLoading={sendReminders.isPending}
            >
              {sendReminders.isPending
                ? 'Enviando...'
                : `Confirmar (${selectedIds.size})`}
            </Button>
            <Button variant="ghost" onClick={handleCancelSelection}>
              Cancelar
            </Button>
          </Container>
        )}
      </div>

      {isLoading ? (
        <>
          <div className="hidden md:block">
            <TableSkeleton />
          </div>
          <CardsSkeleton />
        </>
      ) : employees.length > 0 ? (
        <>
          <div className="hidden md:block">
            <DataTable
              columns={columns}
              data={employees}
              pagination={paginationMeta}
            />
          </div>
          <div className="md:hidden">
            <EmployeeCards
              employees={employees}
              selectionMode={selectionMode}
              selectedIds={selectedIds}
              onToggleSelection={handleToggleSelection}
            />
            <DataTablePagination
              totalPages={paginationMeta.totalPages}
              totalItems={paginationMeta.totalItems}
            />
          </div>
        </>
      ) : (
        <EmptyState search={search} />
      )}
    </Page>
  );
};
