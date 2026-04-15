import { IRequestContext } from '@server/Application';

export interface IRoles {
  name: string;
  description: string;
  permissions: string[];
  hierarchy: number;
}

export interface IGetRoles extends IRequestContext {}
