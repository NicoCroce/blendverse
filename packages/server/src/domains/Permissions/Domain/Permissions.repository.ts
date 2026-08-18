import { IRequestContext } from '@server/Application';
import { Permissions } from './Permissions.entity';
import { Roles } from './Roles.entity';

export type IGetPermissionsRepository = IRequestContext;
export type IGetRolesRepository = IRequestContext;
export type IGetPermissionsByUserRepository = IRequestContext;
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

export type IGetAdminsRepository = IRequestContext;
export interface IGetRoleByUserIdRepository {
  userId: number;
}

export interface IGetRolesByMaxHierarchyRepository {
  maxHierarchy: number;
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
  getAdmins(params: IGetAdminsRepository): Promise<string[]>;
  getRoleByUserId(params: IGetRoleByUserIdRepository): Promise<Roles | null>;
  getRolesByMaxHierarchy(
    params: IGetRolesByMaxHierarchyRepository,
  ): Promise<Roles[]>;
}
