import { AuthController } from '../Controllers';

const authController = new AuthController();

export const AuthRoutes = {
  auth: {
    login: authController.login,
  },
};
