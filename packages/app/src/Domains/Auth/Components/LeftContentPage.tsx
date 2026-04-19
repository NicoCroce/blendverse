import { Container, Title } from '@app/Aplication';

interface LeftContentPageProps {
  title?: string;
  subtitle?: string;
}

export const LeftContentPage = ({
  title = 'Macrosistemas',
  subtitle = 'Seguridad y Autenticación',
}: LeftContentPageProps) => {
  return (
    <Container
      block
      className="h-full md:p-10 after:absolute after:top-0 after:bottom-0 after:left-0 after:right-0 md:mt-[30dvh]"
    >
      <Container row align="center" className="relative z-10 m-6 mb-10 w-[87%]">
        <Container space="none" className="w-full">
          <Title className="text-white">{title}</Title>
          <Title
            variant="h4"
            className="text-secondary border-b pb-4 opacity-60"
          >
            {subtitle}
          </Title>
        </Container>
      </Container>
    </Container>
  );
};
