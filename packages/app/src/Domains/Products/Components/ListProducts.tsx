import { Link, To } from 'react-router-dom';
import { useDeleteProduct, useGetProducts } from '../Hooks';
import { PRODUCTS_DETAIL_ROUTE } from '../ProductsRoutes';

export const ListProducts = () => {
  const { data, isLoading } = useGetProducts();
  const { mutate } = useDeleteProduct();

  const handleDelete = (id: string) => () => {
    mutate(id);
  };

  const detailPath = (id: string): To =>
    PRODUCTS_DETAIL_ROUTE.replace(':id', id);

  return (
    <div>
      {isLoading ? (
        <h3>Loading...</h3>
      ) : (
        <ul>
          {data?.map(({ id, name, stock }) => (
            <li key={id}>
              {id}
              {name}
              {stock}
              <button type="button" onClick={handleDelete(id)}>
                Borrar
              </button>
              <Link to={detailPath(id)}>Detalles</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
