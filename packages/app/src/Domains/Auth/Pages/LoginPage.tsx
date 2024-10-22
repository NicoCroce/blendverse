import { HalfPage } from '@app/Aplication';
import { LoginForm } from '../Components';
import { useLogout } from '../Hooks/useLogout';

export const LoginPage = () => {
  useLogout();

  return (
    <HalfPage title="Iniciar sesión" left={<p>otro</p>}>
      <LoginForm />
    </HalfPage>
  );
};
