import { container } from '@server/utils/Container';
import { AuthService } from './Application';
import { AuthController } from './Infrastructure';
import { asClass } from 'awilix';
import { Login } from './Domain';

container.register({
  authService: asClass(AuthService).scoped(),
  authController: asClass(AuthController).scoped(),
  _login: asClass(Login).scoped(),
});

export const authController =
  container.resolve<AuthController>('authController');
