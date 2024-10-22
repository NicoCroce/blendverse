import { HalfPage, Title } from '@app/Aplication';
import { RestorePassword } from '../Components';

export const RestorePasswordPage = () => {
  return (
    <HalfPage title="Recuperación de contraseña">
      <Title variant="h3">
        Escribí el e-mail de tu cuenta y recibí las instrucciones para recuperar
        tu constraseña.
      </Title>

      <RestorePassword />
    </HalfPage>
  );
};
