import { IRequestContext } from '@server/Application';
export interface IGetUser extends IRequestContext {
  input: number; // user id
}

export interface IChangePassword extends IRequestContext {
  input: {
    password: string;
    newPassword: string;
    rePassword: string;
  };
}

export interface IGetEmailsByUsersId extends IRequestContext {
  input: number[];
}

export interface IRenewPassword extends IRequestContext {
  input: { mail: string; newPassword: string; rePassword: string };
}

export interface IValidateUserPassword extends IRequestContext {
  input: {
    mail?: string;
    id?: number;
    password: string;
  };
}
