import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@app/Application/Components/ui/badge';
import { Checkbox } from '@app/Application/Components/ui/checkbox';
import { Text } from '@app/Application';
import { OkIcon, NotIcon } from './StatusIcons';

export interface IEmployeeRecord {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  renovar_clave: boolean;
  estado_firma: 'Pendiente' | 'Firmado' | 'Corrupto';
}

interface EmployeeColumnsOptions {
  selectionMode: boolean;
  selectedIds: Set<number>;
  onToggleSelection: (id: number) => void;
  onToggleAll: () => void;
}

export const getRenovarClaveVariant = (needsRenewal: boolean) =>
  needsRenewal ? 'secondary' : 'default';

export const getEstadoFirmaVariant = (estado: string) => {
  if (estado === 'Firmado') return 'default';
  if (estado === 'Corrupto') return 'destructive';
  return 'secondary';
};

export const employeeColumns = (
  options: EmployeeColumnsOptions,
): ColumnDef<IEmployeeRecord>[] => {
  const { selectionMode, selectedIds, onToggleSelection, onToggleAll } =
    options;

  const columns: ColumnDef<IEmployeeRecord>[] = [];

  if (selectionMode) {
    columns.push({
      id: 'select',
      header: () => (
        <Checkbox
          checked={selectedIds.size > 0}
          onCheckedChange={() => onToggleAll()}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.has(row.original.id)}
          onCheckedChange={() => onToggleSelection(row.original.id)}
        />
      ),
    });
  }

  columns.push(
    {
      accessorKey: 'apellido',
      header: 'Apellido',
      cell: ({ row }) => row.getValue('apellido'),
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => row.getValue('nombre'),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue('email')}
        </span>
      ),
    },
    {
      accessorKey: 'renovar_clave',
      header: 'Contraseña actualizada',
      cell: ({ row }) => {
        const needsRenewal = row.getValue('renovar_clave') as boolean;
        return (
          <Badge variant="secondary">
            {needsRenewal ? (
              <Text>
                <OkIcon /> Actualizada
              </Text>
            ) : (
              <Text>
                <NotIcon /> Debe renovar
              </Text>
            )}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'estado_firma',
      header: 'Términos firmados',
      cell: ({ row }) => {
        const estado = row.getValue(
          'estado_firma',
        ) as IEmployeeRecord['estado_firma'];
        const Icon = estado === 'Firmado' ? <OkIcon /> : <NotIcon />;
        return (
          <Badge variant="secondary">
            <Text>
              {Icon} {estado}
            </Text>
          </Badge>
        );
      },
    },
  );

  return columns;
};
