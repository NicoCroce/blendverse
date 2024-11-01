import { asClass } from 'awilix';
import { UsersService } from './Application';
import {
  UsersController,
  UsersRepositoryImplementationLocal,
} from './Infrastructure';
import {
  GetUsers,
  GetUser,
  RegisterUser,
  DeleteUser,
  UpdateUser,
  ChangePassword,
} from './Domain';

export const userApp = {
  usersRepository: asClass(UsersRepositoryImplementationLocal),
  usersService: asClass(UsersService),
  usersController: asClass(UsersController),
  _getUsers: asClass(GetUsers),
  _getUser: asClass(GetUser),
  _registerUser: asClass(RegisterUser),
  _deleteUser: asClass(DeleteUser),
  _updateUser: asClass(UpdateUser),
  _changePassword: asClass(ChangePassword),
};
