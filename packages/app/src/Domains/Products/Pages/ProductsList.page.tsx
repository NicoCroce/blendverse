import AnimatedLayout from '@app/Aplication/Components/AnimatedLayout';
import { Page } from '@app/Aplication/Components/Page/Page';
import { ListProducts } from '../Components';

export const ProductsListPage = () => {
  return (
    <Page title="Listado de productos">
      <AnimatedLayout>
        <ListProducts />
      </AnimatedLayout>
    </Page>
  );
};
