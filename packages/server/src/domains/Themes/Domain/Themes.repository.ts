import { IPagination, IRequestContext } from '@server/Application';
import { Theme } from './Themes.entity';

export interface IGetThemesRepository extends IRequestContext {
  filters?: {
    nombre?: string;
  } & IPagination;
}

export interface ICreateThemeRepository extends IRequestContext {
  theme: Theme;
}

export interface IGetThemeRepository extends IRequestContext {
  id: number;
}

export interface IUpdateThemeRepository extends IRequestContext {
  theme: Theme;
}

export interface IDeleteThemeRepository extends IRequestContext {
  id: number;
}

export interface ThemesRepository {
  getAllThemes(params: IGetThemesRepository): Promise<Theme[]>;
  create(params: ICreateThemeRepository): Promise<Theme | null>;
  update(params: IUpdateThemeRepository): Promise<number | null>;
  delete(params: IDeleteThemeRepository): Promise<number | null>;
  getTheme(params: IGetThemeRepository): Promise<Theme | null>;
}
