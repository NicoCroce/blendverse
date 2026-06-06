import { Page } from '@app/Application';
import { ChangePasswordForm } from '../Components';

export const ChangePasswordPage = () => {
  return (
    <Page title="Cambiar contraseña" size="small">
      <ChangePasswordForm />
    </Page>
  );
};
