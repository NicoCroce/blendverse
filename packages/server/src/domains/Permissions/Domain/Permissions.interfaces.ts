import { IRequestContext } from '@server/Application';

export interface IPermissions {
  name: string;
  description: string;
}

export interface IGetPermissions extends IRequestContext {}
export interface IGetPermissionsByUser extends IRequestContext {}
export interface IAssociateUserToRole extends IRequestContext {
  input: {
    userId: number;
    role: string;
  };
}
export interface IGetRoleByUser extends IRequestContext {
  input: number; // userID
}
