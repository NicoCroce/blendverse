import { Checkbox } from '@app/Application/Components/ui/checkbox';
import { IEmployeeRecord } from './EmpleadosColumns';
import { Text, Container } from '@app/Application';
import { OkIcon, NotIcon } from './StatusIcons';

interface EmployeeCardsProps {
  employees: IEmployeeRecord[];
  selectionMode: boolean;
  selectedIds: Set<number>;
  onToggleSelection: (id: number) => void;
}

export const EmployeeCards = ({
  employees,
  selectionMode,
  selectedIds,
  onToggleSelection,
}: EmployeeCardsProps) => (
  <Container space="small" className="md:hidden">
    {employees.map((employee) => {
      const isSelected = selectedIds.has(employee.id);
      return (
        <Container
          row
          align="start"
          key={employee.id}
          className="gap-3 rounded-md border bg-card p-3 data-[state=selected]:border-primary"
          data-state={isSelected ? 'selected' : undefined}
        >
          {selectionMode && (
            <Container row align="center" className="-m-1 shrink-0 p-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelection(employee.id)}
                className="h-5 w-5"
                aria-label={`Seleccionar ${employee.nombre} ${employee.apellido}`}
              />
            </Container>
          )}
          <Container className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {employee.apellido}, {employee.nombre}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {employee.email}
            </p>
            <dl className="mt-2 space-y-1">
              <Container
                row
                align="baseline"
                justify="between"
                space="small"
                className="text-sm"
              >
                <dt className="text-muted-foreground">
                  Contraseña actualizada
                </dt>
                <dd className="shrink-0 font-medium text-foreground">
                  {employee.renovar_clave ? (
                    <Text>
                      <NotIcon /> Debe renovar
                    </Text>
                  ) : (
                    <Text>
                      <OkIcon /> Actualizada
                    </Text>
                  )}
                </dd>
              </Container>
              <Container
                row
                align="baseline"
                justify="between"
                space="small"
                className="text-sm"
              >
                <dt className="text-muted-foreground">Términos firmados</dt>
                <dd className="shrink-0 font-medium text-foreground">
                  {employee.estado_firma !== 'Firmado' ? (
                    <Text>
                      <NotIcon /> {employee.estado_firma}
                    </Text>
                  ) : (
                    <Text>
                      <OkIcon /> {employee.estado_firma}
                    </Text>
                  )}
                </dd>
              </Container>
            </dl>
          </Container>
        </Container>
      );
    })}
  </Container>
);
