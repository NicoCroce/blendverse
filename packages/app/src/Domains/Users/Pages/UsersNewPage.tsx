import AnimatedLayout from '@app/Aplication/Components/AnimatedLayout';
import { NewUserForm } from '../Components';
import { Page } from '@app/Aplication/Components/Page/Page';

export const UsersNewPage = () => (
  <Page title="Nuevo usuario">
    <AnimatedLayout>
      <NewUserForm />
    </AnimatedLayout>
  </Page>
);
