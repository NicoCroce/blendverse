import { asClass } from 'awilix';
import { AuthService } from './Application';
import {
  Login,
  RestorePassword,
  RenewPasswordAuth,
} from './Application/UseCases';
import { AuthController } from './Infrastructure';
import { AuthRepositoryImplementation } from './Infrastructure/Repository/AuthRepository.implementation';
import { container } from '@server/Infrastructure/di/Container';

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
