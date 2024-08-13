import { Page } from '@app/Aplication';
import { NewProductForm } from '../Components/NewProductForm';
import { Card } from '@app/Aplication/Components/ui/card';

export const NewProduct = () => {
  return (
    <Page title="Agregar Producto" size="small">
      <Card className="p-4">
        <NewProductForm />
      </Card>
    </Page>
  );
};
