import { Page, Title } from '@app/Aplication';
import { RestorePassword } from '../Components';

export const RestorePasswordPage = () => {
  return (
    <Page title="Recuperación de contraseña" size="small">
      <Title variant="h3">
        Escribí el e-mail de tu cuenta y recibí las instrucciones para recuperar
        tu constraseña.
      </Title>

      <RestorePassword />
    </Page>
  );
};
