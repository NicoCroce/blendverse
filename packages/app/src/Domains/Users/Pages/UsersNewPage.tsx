import { UserForm } from '../Components';
import { Page } from '@app/Aplication/Components';
import { Card } from '@app/Aplication/Components/ui/card';

export const UsersNewPage = () => (
  <Page title="Nuevo usuario" size="small" backButton>
    <Card className="p-4">
      <UserForm />
    </Card>
  </Page>
);
