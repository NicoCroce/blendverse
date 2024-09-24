import { IRequestContext } from '@server/Application';

export interface Ilogin extends IRequestContext {
  input: {
    mail: string;
    password: string;
  };
}

export interface IValidateUserPassword extends IRequestContext {
  input: {
    mail?: string;
    id?: string;
    password: string;
  };
}

export interface IExecuteResponse {
  token: string;
}
