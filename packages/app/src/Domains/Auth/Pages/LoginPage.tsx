import { Container, HalfPage, Title } from '@app/Aplication';
import { LoginForm } from '../Components';
import { useLogout } from '../Hooks/useLogout';

const bg = '/public/images/login.png';

const Left = () => (
  <Container
    block
    className="h-full md:p-10 after:absolute after:top-0 after:bottom-0 after:left-0 after:right-0 after:backdrop-blur-sm md:mt-[30dvh]"
  >
    <Container row align="center" className="relative z-10 m-6 mb-10">
      <Container space="none">
        <Title className="text-white">Aplicaciones a tu medida</Title>
        <Title variant="h2" className="text-secondary">
          Macrosistemas
        </Title>
      </Container>
    </Container>
  </Container>
);

export const LoginPage = () => {
  useLogout();

  return (
    <HalfPage title="Iniciar sesión" left={<Left />} background={bg}>
      <LoginForm />
    </HalfPage>
  );
};
