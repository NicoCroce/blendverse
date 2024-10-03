import { IRequestContext } from '@server/Application';
import { User } from '@server/domains/Users';

export interface Ilogin extends IRequestContext {
  input: {
    mail: string;
    password: string;
  };
}

export interface IValidateUserPassword extends IRequestContext {
  input: {
    mail?: string;
    id?: number;
    password: string;
  };
}

export interface IExecuteResponse {
  token: string;
  user: User;
}
