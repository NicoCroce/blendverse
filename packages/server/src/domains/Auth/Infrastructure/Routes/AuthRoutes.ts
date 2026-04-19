import { authController } from '../../auth.app';

export const AuthRoutes = () => {
  const { login, logout, restorePassword, renewPasswordAuth } =
    authController();

  return {
    auth: {
      login: login(),
      logout: logout(),
      restorePassword: restorePassword(),
      renewPasswordAuth: renewPasswordAuth(),
    },
  };
};
