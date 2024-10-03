import { container } from '@server/utils/Container';
import { UsersService } from './Application';
import { asClass } from 'awilix';
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
} from './Domain';

container.register({
  usersRepository: asClass(UsersRepositoryImplementationLocal),
  usersService: asClass(UsersService),
  usersController: asClass(UsersController),
  _getUsers: asClass(GetUsers),
  _getUser: asClass(GetUser),
  _registerUser: asClass(RegisterUser),
  _deleteUser: asClass(DeleteUser),
  _updateUser: asClass(UpdateUser),
});

export const usersController =
  container.resolve<UsersController>('usersController');
