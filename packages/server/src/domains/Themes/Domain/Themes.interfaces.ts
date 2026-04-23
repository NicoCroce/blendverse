import { IRequestContext } from '@server/Application';

export interface IGetAllThemes extends IRequestContext {
  input?: {
    nombre: string;
  };
}

export interface IGetTheme extends IRequestContext {
  input: number;
}

export interface ITheme {
  nombre: string;
  color_clase: string;
  texto_clase: string;
  color_primary_hsl: string;
  id?: number;
}
