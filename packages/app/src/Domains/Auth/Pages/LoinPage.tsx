import { Page } from '@app/Aplication';
import { LoginForm } from '../Components';
import { useLogout } from '../Hooks/useLogout';

export const LoginPage = () => {
  useLogout();

  return (
    <Page title="Iniciar sesión" size="small">
      <LoginForm />
    </Page>
  );
};
