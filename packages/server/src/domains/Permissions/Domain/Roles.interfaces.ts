import { IRequestContext } from '@server/Application';

export interface IRoles {
  name: string;
  description: string;
  permissions: string[];
}

export interface IGetRoles extends IRequestContext {}
