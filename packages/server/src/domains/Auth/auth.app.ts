import { container } from '@server/utils/Container';
import { AuthService } from './Application';
import { AuthController, AuthRepositoryImplementation } from './Infrastructure';
import { asClass } from 'awilix';
import { Login, RegisterUser } from './Domain';

container.register({
  authRepository: asClass(AuthRepositoryImplementation).scoped(),
  authService: asClass(AuthService).scoped(),
  authController: asClass(AuthController).scoped(),
  _login: asClass(Login).scoped(),
  _register: asClass(RegisterUser).scoped(),
});

export const authController =
  container.resolve<AuthController>('authController');
