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
} from './Domain';
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
};

export const usersController = () =>
  container.resolve<UsersController>('usersController');
