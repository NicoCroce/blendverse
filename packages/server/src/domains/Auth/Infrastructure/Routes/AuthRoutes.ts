import { authController } from '../../auth.app';

const { login, logout } = authController;

export const AuthRoutes = {
  auth: {
    login: login,
    logout,
  },
};
