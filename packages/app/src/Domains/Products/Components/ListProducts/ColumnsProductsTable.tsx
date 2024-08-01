import { ColumnDef } from '@tanstack/react-table';
import { DeleteProduct } from './DeleteProduct';

export type TProduct = {
  id: string;
  name: string;
  description: string;
  stock: number;
  price: number;
};

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
      const amount = parseFloat(row.getValue('price'));
      const formatted = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'action',
    header: () => <div className="text-right">Acción</div>,
    cell: DeleteProduct,
  },
];
