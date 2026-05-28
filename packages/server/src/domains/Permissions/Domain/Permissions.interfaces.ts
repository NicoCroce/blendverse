import { IRequestContext } from '@server/Application';

export interface IPermissions {
  name: string;
  description: string;
}

export type IGetPermissions = IRequestContext;
export type IGetPermissionsByUser = IRequestContext;
export interface IAssociateUserToRole extends IRequestContext {
  input: {
    userId: number;
    role: string | null;
  };
}
export interface IGetRoleByUser extends IRequestContext {
  input: number; // userID
}
