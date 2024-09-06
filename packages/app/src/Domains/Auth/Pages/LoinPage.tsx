import { Page } from '@app/Aplication';
import { LoginForm } from '../Components';

export const LoginPage = () => {
  return (
    <Page title="Iniciar sesión" size="small">
      <LoginForm />
    </Page>
  );
};
