import { RequestContext } from '../Entities';

export interface IErrorAdapter<T> {
  adapt(error: unknown, requestContext?: RequestContext | string): T;
}
