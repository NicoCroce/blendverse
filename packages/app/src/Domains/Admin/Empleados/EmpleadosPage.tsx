import { Container, Page, Input } from '@app/Application';
import { DataTable } from '@app/Application/Components/Organisms/DataCollection/DataTable';
import { Button } from '@app/Application/Components';
import { StatisticsEmpleados } from '@app/Domains/Admin/Components/StatisticsEmpleados';
import { useEmpleadosPage } from './useEmpleadosPage';

export const EmpleadosPage = () => {
  const {
    search,
    handleSearch,
    selectionMode,
    handleActivateSelection,
    handleConfirmReminders,
    sendReminders,
    selectedIds,
    employees,
    paginationMeta,
    columns,
    isLoading,
  } = useEmpleadosPage();

  return (
    <Page title="Empleados">
      <Container space="small">
        <StatisticsEmpleados />
      </Container>
      <Container space="small" row className="gap-2">
        <Input
          placeholder="Buscar por nombre, apellido o email..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {!selectionMode ? (
          <Button variant="outline" onClick={handleActivateSelection}>
            Enviar recordatorios
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={handleConfirmReminders}
            disabled={sendReminders.isPending || selectedIds.size === 0}
            isLoading={sendReminders.isPending}
          >
            Confirmar
          </Button>
        )}
      </Container>
      <DataTable
        columns={columns}
        data={employees}
        pagination={paginationMeta}
      />
      {isLoading && (
        <p className="text-center text-muted-foreground">Cargando...</p>
      )}
    </Page>
  );
};
