import { NewUserForm } from '../Components';
import { Page } from '@app/Aplication/Components';
import { Card } from '@app/Aplication/Components/ui/card';

export const UsersNewPage = () => (
  <Page title="Nuevo usuario" size="small">
    <Card className="p-4">
      <NewUserForm />
    </Card>
  </Page>
);
