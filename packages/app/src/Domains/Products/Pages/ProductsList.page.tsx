import { Title } from '@app/Aplication/Components/Typography/Title';
import { ListProducts } from '../Components';
import AnimatedLayout from '@app/Aplication/Components/AnimatedLayout';

export const ProductsListPage = () => {
  return (
    <AnimatedLayout>
      <Title variant="h1">Listado de productos</Title>
      <ListProducts />
    </AnimatedLayout>
  );
};
