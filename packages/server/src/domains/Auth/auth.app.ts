import { AuthService } from './Application';
import { AuthController } from './Infrastructure';
import { asClass } from 'awilix';
import { Login, RestorePassword } from './Application/UseCases';
import { AuthRepositoryImplementation } from './Infrastructure/Repository/AuthRepository.implementation';
import { container } from '@server/utils/Container';
import { RenewPasswordAuth } from './Application/UseCases/RenewPasswordAuth.usecase';

export const authApp = {
  authRepository: asClass(AuthRepositoryImplementation),
  authService: asClass(AuthService),
  authController: asClass(AuthController),
  _login: asClass(Login),
  _restorePassword: asClass(RestorePassword),
  _renewPasswordAuth: asClass(RenewPasswordAuth),
};

export const authController = () =>
  container.resolve<AuthController>('authController');
