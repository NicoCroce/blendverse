import { AuthPageLayout, LeftContentPage, LoginForm } from '../Components';
import { useLogout } from '../Hooks/useLogout';

const bg = '/images/login.png';

export const LoginPage = () => {
  useLogout();

  return (
    <AuthPageLayout
      title="Iniciar sesión"
      left={<LeftContentPage title="MacroGest" subtitle="Macrosistemas" />}
      background={bg}
    >
      <LoginForm />
    </AuthPageLayout>
  );
};
