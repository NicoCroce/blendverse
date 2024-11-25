import { IRequestContext } from '@server/Application';
import { Permissions } from './Permissions.entity';
import { Roles } from './Roles.entity';

export interface IGetPermissionsRepository extends IRequestContext {}
export interface IGetRolesRepository extends IRequestContext {}

export interface PermissionsRepository {
  getPermissions(params: IGetPermissionsRepository): Promise<Permissions[]>;
  getRoles(params: IGetRolesRepository): Promise<Roles[]>;
}
