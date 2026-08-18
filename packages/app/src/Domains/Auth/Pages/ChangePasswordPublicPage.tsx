import { HalfPage, Title } from '@app/Application';
import { ChangePasswordFormPublic } from '../Components/ChangePasswordPublicForm';
import { LeftContentPage } from '../Components/LeftContentPage';

const bg = '/images/password.jpg';

export const ChangePasswordPublicPage = () => {
  return (
    <HalfPage
      title="Cambio de contraseña"
      background={bg}
      left={<LeftContentPage />}
    >
      <Title variant="h3">Ingresá tu contraseña nueva</Title>

      <ChangePasswordFormPublic />
    </HalfPage>
  );
};
