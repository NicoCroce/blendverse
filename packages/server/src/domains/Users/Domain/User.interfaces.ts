import { IRequestContext } from '@server/Application';

export interface IGetUsers extends IRequestContext {}
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
