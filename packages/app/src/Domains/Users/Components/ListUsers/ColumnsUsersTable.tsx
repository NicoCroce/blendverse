import { Badge } from '@app/Aplication/Components/ui/badge';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColumnDef } from '@tanstack/react-table';
import { ActionsUsers } from './ActionUsers';
import { TUser } from '../../User.entity';

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
    header: () => (
      <div className="flex items-center justify-end">
        <FontAwesomeIcon className="p-2" icon={faUser} />
        <span>Nombre</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right">
        <Badge>{row.getValue('name')}</Badge>
      </div>
    ),
  },
  {
    accessorKey: 'actions',
    header: () => <div className="text-end">Acción</div>,
    cell: ActionsUsers,
  },
];
