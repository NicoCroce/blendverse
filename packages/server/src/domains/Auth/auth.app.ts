import { container } from '@server/utils/Container';
import { AuthService } from './Application';
import { AuthController } from './Infrastructure';
import { asClass } from 'awilix';
import { Login } from './Domain';
import { ValidateUserPassword, RestorePassword } from './Domain/UseCases';
import { AuthRepositoryImplementation } from './Infrastructure/Repository/AuthRepository.implementation';

container.register({
  authRepository: asClass(AuthRepositoryImplementation),
  authService: asClass(AuthService),
  authController: asClass(AuthController),
  _login: asClass(Login),
  _validateUserPassword: asClass(ValidateUserPassword),
  _restorePassword: asClass(RestorePassword),
});

export const authController =
  container.resolve<AuthController>('authController');
