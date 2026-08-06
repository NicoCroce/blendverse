import { asClass } from 'awilix';
import {
  UsersController,
  UsersRepositoryImplementation,
} from './Infrastructure';
import {
  ChangePassword,
  CountActiveEmployees,
  GetAllActiveOwners,
  GetEmailsByUsersId,
  ValidateUserPassword,
  RenewPassword,
  UsersService,
  GetUser,
} from './Application';
import { container } from '@server/Infrastructure/di/Container';

export const userApp = {
  usersRepository: asClass(UsersRepositoryImplementation),
  usersService: asClass(UsersService),
  usersController: asClass(UsersController),
  _changePassword: asClass(ChangePassword),
  _getUser: asClass(GetUser),

  _getEmailsByUsersId: asClass(GetEmailsByUsersId),
  _renewPassword: asClass(RenewPassword),
  _validateUserPassword: asClass(ValidateUserPassword),
  // Reporte diario (daily-admin-report)
  _getAllActiveOwners: asClass(GetAllActiveOwners),
  _countActiveEmployees: asClass(CountActiveEmployees),
};

export const usersController = () =>
  container.resolve<UsersController>('usersController');
