import { IRequestContext } from '@server/Application';
export interface IGetAllStreets extends IRequestContext {
  input?: {
    denominacion: string;
  };
}
export interface ICreateStreet extends IRequestContext {
  input: {
    denominacion: string;
    id: number;
  };
}
export interface IGetStreet extends IRequestContext {
  input: number;
}
export interface IUpdateStreet extends IRequestContext {
  input: {
    id: number;
    denominacion: string;
  };
}
export interface IDeleteStreet extends IRequestContext {
  input: number;
}
export interface IStreet {
  denominacion: string;
  id?: number;
}
