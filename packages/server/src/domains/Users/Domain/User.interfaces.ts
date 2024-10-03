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
  input: number; // user id
}
export interface IValidateUser extends IRequestContext {
  input: {
    id?: number;
    mail?: string;
  };
}

export interface IUpdateUser extends IRequestContext {
  input: {
    id: number;
    mail: string;
    name: string;
  };
}
export interface IDeleteUser extends IRequestContext {
  input: number; // User Id
}

export interface IUser {
  id?: number;
  mail: string;
  name: string;
  password?: string;
  userImage?: string;
  companyLogo?: string;
  companyName?: string;
}
