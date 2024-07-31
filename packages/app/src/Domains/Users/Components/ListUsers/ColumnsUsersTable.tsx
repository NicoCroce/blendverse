import { Badge } from '@app/Aplication/Components/ui/badge';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColumnDef } from '@tanstack/react-table';

export type TUser = {
  id: string;
  mail: string;
  name: string;
  password: string;
};

export const columns: ColumnDef<TUser>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'mail',
    header: 'Mail',
  },
  {
    accessorKey: 'name',
    header: 'Nombre',
  },
  {
    accessorKey: 'password',
    header: () => (
      <div className="text-right flex justify-end items-center">
        <FontAwesomeIcon icon={faKey} className="p-2 cursor-pointer" />
        <span>Contraseña</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right">
        <Badge variant="destructive">{row.getValue('password')}</Badge>
      </div>
    ),
  },
];
