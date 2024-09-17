import { IRequestContext } from '@server/Application';
import { User } from './User.entity';

export interface IGetUsersRepository extends IRequestContext {}
export interface IRegisterUserRepository extends IRequestContext {
  user: User;
}
export interface IGetUserRepository extends IRequestContext {
  id: string;
}
export interface IValidateUserRepository extends IRequestContext {
  mail: string;
}

export interface IUpdateUserRepository extends IRequestContext {
  user: User;
}
export interface IDeleteUserRepository extends IRequestContext {
  id: string;
}

export interface UserRepository {
  getUsers(params: IGetUsersRepository): Promise<User[]>;
  registerUser(params: IRegisterUserRepository): Promise<User>;
  getUser(params: IGetUserRepository): Promise<User | null>;
  validateUser(params: IValidateUserRepository): Promise<User | null>;
  updateUser(params: IUpdateUserRepository): Promise<User | null>;
  deleteUser(params: IDeleteUserRepository): Promise<User | null>;
}
