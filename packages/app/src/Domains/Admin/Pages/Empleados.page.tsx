import {
  Container,
  EmptyScreenError,
  Page,
  Input,
  useDevice,
} from '@app/Application';
import { DataTable } from '@app/Application/Components/Organisms/DataCollection/DataTable';
import { DataTablePagination } from '@app/Application/Components/Organisms/DataCollection/DataTablePagination';
import { Button } from '@app/Application/Components';
import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { StatisticsEmpleados } from '@app/Domains/Admin/Components/StatisticsEmpleados';
import { EmployeeCards } from '../Components/EmployeeCards';
import { TableSkeleton } from '../Components/TableSkeleton';
import { CardsSkeleton } from '../Components/CardsSkeleton';
import { EmpleadosEmptyState } from '../Components/EmpleadosEmptyState';
import { useEmpleadosPage } from '../Hooks/useEmpleadosPage';

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
    isError,
    error,
  } = useEmpleadosPage();
  const { isMobile } = useDevice();

  return (
    <Page title="Empleados">
      <StatisticsEmpleados />

      <Container row className="flex-col sm:flex-row" space="small">
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
      </Container>

      {isError ? (
        <EmptyScreenError message={error?.message} />
      ) : isLoading ? (
        isMobile ? (
          <CardsSkeleton />
        ) : (
          <TableSkeleton />
        )
      ) : employees.length > 0 ? (
        isMobile ? (
          <>
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
          </>
        ) : (
          <DataTable
            columns={columns}
            data={employees}
            pagination={paginationMeta}
          />
        )
      ) : (
        <EmpleadosEmptyState search={search} />
      )}
    </Page>
  );
};
