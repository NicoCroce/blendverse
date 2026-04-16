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
        <span>Nombre</span>
      </div>
    ),
    cell: ({ row }) => <div className="text-right">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'actions',
    header: () => <div className="text-end">Acción</div>,
    cell: ActionsUsers,
  },
];
