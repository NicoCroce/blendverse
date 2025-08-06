import { authController } from '../../auth.app';

export const AuthRoutes = () => {
  const { login, logout, restorePassword } = authController();

  return {
    auth: {
      login: login(),
      logout: logout(),
      restorePassword: restorePassword(),
    },
  };
};
