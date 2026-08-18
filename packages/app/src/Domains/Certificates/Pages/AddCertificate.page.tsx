import { Page } from '@app/Application';
import { AddLicenseForm } from '../Components/AddLicenseForm/AddLicenseForm';
import { Card } from '@app/Application/Components/ui/card';

export const AddCertificatePage = () => {
  return (
    <Page title="Agregar licencia" size="small" backButton>
      <Card className="p-4">
        <AddLicenseForm />
      </Card>
    </Page>
  );
};
