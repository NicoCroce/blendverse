import { Checkbox } from '@app/Application/Components/ui/checkbox';
import { IEmployeeRecord } from './columns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Text } from '@app/Application';

import {
  faCircleCheck,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';

interface EmployeeCardsProps {
  employees: IEmployeeRecord[];
  selectionMode: boolean;
  selectedIds: Set<number>;
  onToggleSelection: (id: number) => void;
}

const OkIcon = () => <FontAwesomeIcon icon={faCircleCheck} color="green" />;
const NotIcon = () => (
  <FontAwesomeIcon icon={faCircleExclamation} className="text-amber-700" />
);

export const EmployeeCards = ({
  employees,
  selectionMode,
  selectedIds,
  onToggleSelection,
}: EmployeeCardsProps) => (
  <ul className="flex flex-col gap-2 md:hidden">
    {employees.map((employee) => {
      const isSelected = selectedIds.has(employee.id);
      return (
        <li
          key={employee.id}
          data-state={isSelected && 'selected'}
          className="flex items-start gap-3 rounded-md border bg-card p-3 data-[state=selected]:border-primary"
        >
          {selectionMode && (
            <div className="-m-1 flex shrink-0 items-center p-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelection(employee.id)}
                className="h-5 w-5"
                aria-label={`Seleccionar ${employee.nombre} ${employee.apellido}`}
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {employee.apellido}, {employee.nombre}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {employee.email}
            </p>
            <dl className="mt-2 space-y-1">
              <div className="flex items-baseline justify-between gap-2 text-sm">
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
              </div>
              <div className="flex items-baseline justify-between gap-2 text-sm">
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
              </div>
            </dl>
          </div>
        </li>
      );
    })}
  </ul>
);
