import { IRequestContext } from '@server/Application';

export interface IGetUsers extends IRequestContext {
  input?: {
    name?: string;
  };
}
export interface IRegisterUser extends IRequestContext {
  input: {
    mail: string;
    name: string;
    password: string;
    rePassword: string;
  };
}
export interface IGetUser extends IRequestContext {
  input: string; // user id
}
export interface IValidateUser extends IRequestContext {
  input: string; // user mail
}

export interface IUpdateUser extends IRequestContext {
  input: {
    id: string;
    mail: string;
    name: string;
  };
}
export interface IDeleteUser extends IRequestContext {
  input: string; // User Id
}
