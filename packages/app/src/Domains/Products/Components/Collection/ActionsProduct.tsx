import { Link, To } from 'react-router-dom';
import { Row } from '@tanstack/react-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AlertDialogCancelConfirm } from '@app/Aplication/Components';
import { AlertDialogTrigger } from '@app/Aplication/Components/ui/alert-dialog';
import { useDeleteProduct } from '../../Hooks';
import { PRODUCTS_DETAIL_ROUTE } from '../../ProductsRoutes';
import { TProduct } from '../../Entities/Product';

export const ActionsProduct = ({ row }: { row: Row<TProduct> }) => {
  const { mutate } = useDeleteProduct();
  const handleDelete = (id: string) => mutate(id);
  const detailPath = (id: string): To =>
    PRODUCTS_DETAIL_ROUTE.replace(':id', id);

  return (
    <div className="flex gap-4 justify-end items-center">
      <Link to={detailPath(row.getValue('id'))}>
        <FontAwesomeIcon icon={faEye} />
      </Link>
      <AlertDialogCancelConfirm
        onConfirm={() => handleDelete(row.getValue('id'))}
      >
        <AlertDialogTrigger asChild>
          <FontAwesomeIcon icon={faTrash} className="cursor-pointer" />
        </AlertDialogTrigger>
      </AlertDialogCancelConfirm>
    </div>
  );
};
