import { IPaginationResponse, IRequestContext } from '@server/Application';
import { Ownersys } from './Ownersyss.entity';

export interface IGetOwnersysRepository extends IRequestContext {
  id: number;
}
export interface IUpdateThemeRepository extends IRequestContext {
  tema: number;
}

export interface IGetOwnerThemeRepository extends IRequestContext {}

export interface IGetOwnersyssRepositoryResponse
  extends IPaginationResponse<Ownersys[]> {}
export interface OwnersyssRepository {
  updateTheme(params: IUpdateThemeRepository): Promise<number | null>;
  getOwnersys(params: IGetOwnersysRepository): Promise<Ownersys | null>;

  getOwnerTheme(params: IGetOwnerThemeRepository): Promise<number | null>;
}
