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
    role: string | null;
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
    role: string | null;
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
  renewPassword?: boolean;
  userImage?: string;
  ownerId?: number;
  companyLogo?: string;
  companyName?: string;
}

export interface IChangePassword extends IRequestContext {
  input: {
    password: string;
    newPassword: string;
    rePassword: string;
  };
}
