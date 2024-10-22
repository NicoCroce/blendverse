import { HalfPage } from '@app/Aplication';
import { LoginForm } from '../Components';
import { useLogout } from '../Hooks/useLogout';

export const LoginPage = () => {
  useLogout();

  return (
    <HalfPage title="Iniciar sesión">
      <LoginForm />
    </HalfPage>
  );
};
