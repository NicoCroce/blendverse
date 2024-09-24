import { container } from '@server/utils/Container';
import { AuthService } from './Application';
import { AuthController } from './Infrastructure';
import { asClass } from 'awilix';
import { Login } from './Domain';
import { ValidateUserPassword } from './Domain/UseCases/ValidateUserPassword.usecase';

container.register({
  authService: asClass(AuthService),
  authController: asClass(AuthController),
  _login: asClass(Login),
  _validateUserPassword: asClass(ValidateUserPassword),
});

export const authController =
  container.resolve<AuthController>('authController');
