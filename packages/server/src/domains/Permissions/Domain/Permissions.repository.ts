import { IRequestContext } from '@server/Application';
import { Permissions } from './Permissions.entity';
import { Roles } from './Roles.entity';

export interface IGetPermissionsRepository extends IRequestContext {}
export interface IGetRolesRepository extends IRequestContext {}
export interface IGetPermissionsByUserRepository extends IRequestContext {}
export interface IAssociateUserToRoleRepository extends IRequestContext {
  userId: number;
  role: string;
}
export interface IDissociateUserToRoleRepository extends IRequestContext {
  userId: number;
}
export interface IGetRoleByUserRepository extends IRequestContext {
  userId: number;
}

export interface PermissionsRepository {
  getPermissions(params: IGetPermissionsRepository): Promise<Permissions[]>;
  getRoles(params: IGetRolesRepository): Promise<Roles[]>;
  getPermissionsByUser(
    params: IGetPermissionsByUserRepository,
  ): Promise<string[]>;
  associateUserToRole(params: IAssociateUserToRoleRepository): Promise<void>;
  dissociateUserToRole(params: IDissociateUserToRoleRepository): Promise<void>;
  getRoleByUser(params: IGetRoleByUserRepository): Promise<string | null>;
}
