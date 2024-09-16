import { IRequestContext } from '@server/Application';

export interface Ilogin extends IRequestContext {
  input: {
    mail: string;
    password: string;
  };
}

export interface IExecuteResponse {
  token: string;
}
