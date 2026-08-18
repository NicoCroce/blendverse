import { IRequestContext } from '@server/Application';

export interface IGetAllThemes extends IRequestContext {
  input?: {
    nombre: string;
  };
}

export interface IGetTheme extends IRequestContext {
  input: number;
}
