import { IRequestContext } from '@server/Application';
import { Street } from './Streets.entity';

export interface IGetStreetsRepository extends IRequestContext {
  filters?: {
    denominacion?: string;
  };
}
export interface ICreateStreetRepository extends IRequestContext {
  street: Street;
}
export interface IGetStreetRepository extends IRequestContext {
  id: number;
}
export interface IUpdateStreetRepository extends IRequestContext {
  street: Street;
}
export interface IDeleteStreetRepository extends IRequestContext {
  id: number;
}
export interface StreetsRepository {
  getAllStreets(params: IGetStreetsRepository): Promise<Street[]>;
  create(params: ICreateStreetRepository): Promise<Street | null>;
  update(params: IUpdateStreetRepository): Promise<number | null>;
  delete(params: IDeleteStreetRepository): Promise<number | null>;
  getStreet(params: IGetStreetRepository): Promise<Street | null>;
}
