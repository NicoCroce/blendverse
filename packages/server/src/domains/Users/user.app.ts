import { asClass } from 'awilix';
import { UsersService } from './Application';
import {
  UsersController,
  UsersRepositoryImplementation,
} from './Infrastructure';
import {
  GetUsers,
  GetUser,
  RegisterUser,
  DeleteUser,
  UpdateUser,
  ChangePassword,
  GetSelectUser,
  GetEmailsByUsersId,
  ValidateUserPassword,
  RenewPassword,
} from './Application';
import { container } from '@server/utils/Container';

export const userApp = {
  usersRepository: asClass(UsersRepositoryImplementation),
  usersService: asClass(UsersService),
  usersController: asClass(UsersController),
  _getUsers: asClass(GetUsers),
  _getUser: asClass(GetUser),
  _registerUser: asClass(RegisterUser),
  _deleteUser: asClass(DeleteUser),
  _updateUser: asClass(UpdateUser),
  _changePassword: asClass(ChangePassword),
  _getSelectUser: asClass(GetSelectUser),
  _getEmailsByUsersId: asClass(GetEmailsByUsersId),
  _renewPassword: asClass(RenewPassword),
  _validateUserPassword: asClass(ValidateUserPassword),
};

export const usersController = () =>
  container.resolve<UsersController>('usersController');
