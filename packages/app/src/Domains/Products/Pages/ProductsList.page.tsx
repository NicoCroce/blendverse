import { Title } from '@app/Aplication/Components/Typography/Title';
import { ListProducts } from '../Components';

export const ProductsListPage = () => {
  return (
    <div>
      <Title variant="h1">Listado de productos</Title>
      <ListProducts />
    </div>
  );
};
