import { UserForm } from '../Components';
import { Page } from '@app/Application/Components';
import { Card } from '@app/Application/Components/ui/card';

export const UsersNewPage = () => (
  <Page title="Nuevo usuario" size="small" backButton>
    <Card className="p-4">
      <UserForm />
    </Card>
  </Page>
);
