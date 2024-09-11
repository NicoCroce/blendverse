import { TRequestContext } from '../Entities';

export interface IErrorAdapter<T> {
  adapt(error: unknown, requestContext?: TRequestContext | string): T;
}
