import { Button, Page } from '@app/Aplication/Components';
import { ListProducts } from '../Components';
import { Link } from 'react-router-dom';
import { PRODUCTS_NEW_ROUTE } from '../ProductsRoutes';

export const ProductsListPage = () => {
  return (
    <Page title="Listado de productos">
      <header className="text-right">
        <Button>
          <Link to={PRODUCTS_NEW_ROUTE}>Agregar Producto</Link>
        </Button>
      </header>
      <ListProducts />
    </Page>
  );
};
