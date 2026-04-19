import {
  AuthPageLayout,
  LeftContentPage,
  RestorePassword,
} from '../Components';

const bg = '/images/restore-password.png';

export const RestorePasswordPage = () => {
  return (
    <AuthPageLayout
      title="Recuperación de contraseña"
      subtitle="Escribí el e-mail de tu cuenta y recibí las instrucciones para recuperar tu constraseña."
      left={<LeftContentPage />}
      background={bg}
    >
      <RestorePassword />
    </AuthPageLayout>
  );
};
