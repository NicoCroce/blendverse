import { authController } from '../../auth.app';

const { login, logout, restorePassword } = authController;

export const AuthRoutes = {
  auth: {
    login: login,
    logout,
    restorePassword,
  },
};
