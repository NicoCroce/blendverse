import { container } from '@server/utils/Container';
import { UsersService } from './Application';
import { UsersController } from './Infrastructure/Controllers/Users.controller';
import { UsersRepositoryImplementation } from './Infrastructure/UsersRepository.implementation.localDB';
import { asClass } from 'awilix';
import { GetAllUsers, GetUser, RegisterUser } from './Domain';

container.register({
  usersRepository: asClass(UsersRepositoryImplementation).scoped(),
  usersService: asClass(UsersService).scoped(),
  usersController: asClass(UsersController).scoped(),
  _getAllUsers: asClass(GetAllUsers).scoped(),
  _getUser: asClass(GetUser).scoped(),
  _registerUser: asClass(RegisterUser).scoped(),
});

export const usersController =
  container.resolve<UsersController>('usersController');
