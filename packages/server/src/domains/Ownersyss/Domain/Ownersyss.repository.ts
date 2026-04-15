import {
  IPagination,
  IPaginationResponse,
  IRequestContext,
  ISelect,
} from '@server/Application';
import { Ownersys } from './Ownersyss.entity';

export interface IGetOwnersyssRepository extends IRequestContext {
  filters?: {
    denominacion?: string;
    logo?: string;
  } & IPagination;
}
export interface ICreateOwnersysRepository extends IRequestContext {
  ownersys: Ownersys;
}
export interface IGetOwnersysRepository extends IRequestContext {
  id: number;
}
export interface IUpdateOwnersysRepository extends IRequestContext {
  ownersys: Ownersys;
}
export interface IDeleteOwnersysRepository extends IRequestContext {
  id: number;
}
export interface IGetSelectOwnersysRepository extends IRequestContext {
  filters?: {
    denominacion?: string;
  };
}
export interface IUpdateThemeRepository extends IRequestContext {
  tema: number;
}

export interface IGetOwnerThemeRepository extends IRequestContext {}

export interface IGetOwnersyssRepositoryResponse
  extends IPaginationResponse<Ownersys[]> {}
export interface OwnersyssRepository {
  getAllOwnersyss(
    params: IGetOwnersyssRepository,
  ): Promise<IGetOwnersyssRepositoryResponse>;
  getSelectOwnersys(params: IGetSelectOwnersysRepository): Promise<ISelect[]>;
  create(params: ICreateOwnersysRepository): Promise<Ownersys | null>;
  update(params: IUpdateOwnersysRepository): Promise<number | null>;
  updateTheme(params: IUpdateThemeRepository): Promise<number | null>;
  delete(params: IDeleteOwnersysRepository): Promise<number | null>;
  getOwnersys(params: IGetOwnersysRepository): Promise<Ownersys | null>;
  getOwnerTheme(params: IGetOwnerThemeRepository): Promise<number | null>;
}
