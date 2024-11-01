import { container } from '@server/utils/Container';
import { AuthController } from '../Controllers';

export const AuthRoutes = () => {
  const { login, logout, restorePassword } =
    container.resolve<AuthController>('authController');

  return {
    auth: {
      login: login,
      logout,
      restorePassword,
    },
  };
};
