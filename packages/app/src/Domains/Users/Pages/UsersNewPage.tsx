import AnimatedLayout from '@app/Aplication/Components/AnimatedLayout';
import { NewUserForm } from '../Components';
import { Page } from '@app/Aplication/Components/Page/Page';
import { Card } from '@app/Aplication/Components/ui/card';

export const UsersNewPage = () => (
  <Page title="Nuevo usuario" size="small">
    <AnimatedLayout>
      <Card className="p-4">
        <NewUserForm />
      </Card>
    </AnimatedLayout>
  </Page>
);
