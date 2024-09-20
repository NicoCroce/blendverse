import { ColumnDef } from '@tanstack/react-table';
import { ActionsProduct } from './ActionsProduct';
import { TProduct } from '../../Product.entity';
import { format } from '@app/Aplication';

export const columns: ColumnDef<TProduct>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Nombre',
  },
  {
    accessorKey: 'description',
    header: 'Descripción',
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
  },
  {
    accessorKey: 'price',
    header: () => <div className="text-right">Precio</div>,
    cell: ({ row }) => {
      const amount: string = row.getValue('price');
      return (
        <div className="text-right font-medium">
          {format.toCurrency(0, amount)}
        </div>
      );
    },
  },
  {
    accessorKey: 'action',
    header: () => <div className="text-right">Acción</div>,
    cell: ActionsProduct,
  },
];
