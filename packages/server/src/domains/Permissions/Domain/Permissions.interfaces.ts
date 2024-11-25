import { IRequestContext } from '@server/Application';

export interface IPermissions {
  name: string;
  description: string;
}

export interface IGetPermissions extends IRequestContext {}
