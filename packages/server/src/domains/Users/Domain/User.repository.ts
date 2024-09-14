import { IRequestContext } from '@server/Application';
import { User } from './User.entity';

interface IGetUsers extends IRequestContext {}
interface IRegisterUser extends IRequestContext {
  user: User;
}
interface IGetUser extends IRequestContext {
  id: string;
}
interface IValidateUser extends IRequestContext {
  mail: string;
}

export interface UserRepository {
  getUsers({ requestContext }: IGetUsers): Promise<User[]>;
  registerUser({ user, requestContext }: IRegisterUser): Promise<User>;
  getUser({ id, requestContext }: IGetUser): Promise<User | null>;
  validateUser({ mail }: IValidateUser): Promise<User | null>;
}
