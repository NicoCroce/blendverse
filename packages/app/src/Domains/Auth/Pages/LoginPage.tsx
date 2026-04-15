import { Container, HalfPage, Title } from '@app/Aplication';
import { LoginForm } from '../Components';
import { useLogout } from '../Hooks/useLogout';

const bg = '/images/login.png';

const Left = () => (
  <Container
    block
    className="h-full md:p-10 after:absolute after:top-0 after:bottom-0 after:left-0 after:right-0 md:mt-[30dvh]"
  >
    <Container row align="center" className="relative z-10 m-6 mb-10 w-[87%]">
      <Container space="none" className="w-full">
        <Title className="text-white">MacroGest</Title>
        <Title variant="h4" className="text-secondary border-b pb-4 opacity-60">
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
