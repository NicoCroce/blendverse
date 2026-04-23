import { IPagination, IRequestContext } from '@server/Application';
import { Theme } from './Themes.entity';

export interface IGetThemesRepository extends IRequestContext {
  filters?: {
    nombre?: string;
  } & IPagination;
}

export interface IGetThemeRepository extends IRequestContext {
  id: number;
}

export interface ThemesRepository {
  getAllThemes(params: IGetThemesRepository): Promise<Theme[]>;
  getTheme(params: IGetThemeRepository): Promise<Theme | null>;
}
