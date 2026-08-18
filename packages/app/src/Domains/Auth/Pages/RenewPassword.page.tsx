import {
  AuthPageLayout,
  ChangePasswordFormPublic,
  LeftContentPage,
} from '../Components';

const bg = '/images/restore-password.png';

export const ChangePasswordPublicPage = () => {
  return (
    <AuthPageLayout
      title="Cambio de contraseña"
      subtitle="Ingresá tu contraseña nueva"
      background={bg}
      left={<LeftContentPage />}
    >
      <ChangePasswordFormPublic />
    </AuthPageLayout>
  );
};
