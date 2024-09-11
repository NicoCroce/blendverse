import { container } from '@server/utils/Container';
import { AuthService } from './Application';
import { AuthController } from './Infrastructure';
import { asClass } from 'awilix';
import { Login } from './Domain';

container.register({
  authService: asClass(AuthService),
  authController: asClass(AuthController),
  _login: asClass(Login),
});

export const authController =
  container.resolve<AuthController>('authController');
