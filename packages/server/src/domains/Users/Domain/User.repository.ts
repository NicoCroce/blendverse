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

export interface UserRepository {
  getUsers({ requestContext }: IGetUsersRepository): Promise<User[]>;
  registerUser({
    user,
    requestContext,
  }: IRegisterUserRepository): Promise<User>;
  getUser({ id, requestContext }: IGetUserRepository): Promise<User | null>;
  validateUser({
    mail,
    requestContext,
  }: IValidateUserRepository): Promise<User | null>;
}
