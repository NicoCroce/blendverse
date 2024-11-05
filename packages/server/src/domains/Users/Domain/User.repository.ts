import { IRequestContext } from '@server/Application';
import { User } from './User.entity';

export interface IGetUsersRepository extends IRequestContext {
  filters?: {
    name?: string;
  };
}
export interface IRegisterUserRepository extends IRequestContext {
  user: User;
}
export interface IGetUserRepository extends IRequestContext {
  id: number;
}
export interface IValidateUserRepository extends IRequestContext {
  mail?: string;
  id?: number;
}

export interface IUpdateUserRepository extends IRequestContext {
  user: User;
}
export interface IDeleteUserRepository extends IRequestContext {
  id: number;
}

export interface IChangePasswordRepository extends IRequestContext {
  password: string;
}

export interface UserRepository {
  getUsers(params: IGetUsersRepository): Promise<User[]>;
  registerUser(params: IRegisterUserRepository): Promise<User>;
  getUser(params: IGetUserRepository): Promise<User | null>;
  validateUser(params: IValidateUserRepository): Promise<User | null>;
  updateUser(params: IUpdateUserRepository): Promise<number | null>;
  deleteUser(params: IDeleteUserRepository): Promise<number | null>;
  changePassword(params: IChangePasswordRepository): Promise<void | null>;
}
