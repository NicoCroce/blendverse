import { IRequestContext } from '@server/Application';

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

export type IGetRoles = IRequestContext;
