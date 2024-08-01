import { faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, To } from 'react-router-dom';
import { useDeleteProduct } from '../../Hooks';
import { PRODUCTS_DETAIL_ROUTE } from '../../ProductsRoutes';
import { Row } from '@tanstack/react-table';
import { TProduct } from './ColumnsProductsTable';

export const DeleteProduct = ({ row }: { row: Row<TProduct> }) => {
  const { mutate } = useDeleteProduct();
  const handleDelete = (id: string) => () => mutate(id);
  const detailPath = (id: string): To =>
    PRODUCTS_DETAIL_ROUTE.replace(':id', id);

  return (
    <div className="flex gap-4 justify-end items-center">
      <Link to={detailPath(row.getValue('id'))}>
        <FontAwesomeIcon icon={faEye} />
      </Link>
      <FontAwesomeIcon
        icon={faTrash}
        className="cursor-pointer"
        onClick={handleDelete(row.getValue('id'))}
      />
    </div>
  );
};
