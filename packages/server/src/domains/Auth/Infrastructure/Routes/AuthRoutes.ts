import { authController } from '../../auth.app';

const { login, register } = authController;

export const AuthRoutes = {
  auth: {
    login: login,
    register: register,
  },
};
