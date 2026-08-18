import { IRequestContext } from '@server/Application';

export interface IGetOwnersys extends IRequestContext {
  input: number;
}

export interface IUpdateTheme extends IRequestContext {
  input: number; // idTheme
}

export type IGetOwnerTheme = IRequestContext;
