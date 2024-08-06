import { ListProducts } from '../Components';
import AnimatedLayout from '@app/Aplication/Components/AnimatedLayout';
import { Page } from '@app/Aplication/Components/Page/Page';

export const ProductsListPage = () => {
  return (
    <Page title="Listado de productos">
      <AnimatedLayout>
        <ListProducts />
      </AnimatedLayout>
    </Page>
  );
};
