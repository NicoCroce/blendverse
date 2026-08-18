import { executeUseCase } from '@server/Application';
import {
  GetPermissions,
  GetPermissionsByUser,
  GetRoleByUser,
  GetRoles,
} from '.';
import { Permissions, Roles } from '../Domain';
import {
  IGetPermissions as IGetPermissionsInput,
  IGetPermissionsByUser as IGetPermissionsByUserInput,
  IGetRoleByUser as IGetRoleByUserInput,
  IGetRoles as IGetRolesInput,
} from './permissions.types';

export class PermissionsService {
  constructor(
    private readonly _getPermissions: GetPermissions,
    private readonly _getRoles: GetRoles,
    private readonly _getPermissionsByUser: GetPermissionsByUser,
    private readonly _getRoleByUser: GetRoleByUser,
  ) {}

  async getPermissions({
    requestContext,
  }: IGetPermissionsInput): Promise<Permissions[]> {
    return executeUseCase({
      useCase: this._getPermissions,
      requestContext,
    });
  }

  async getRoles({ requestContext }: IGetRolesInput): Promise<Roles[]> {
    return executeUseCase({
      useCase: this._getRoles,
      requestContext,
    });
  }

  async getPermissionsByUser({
    requestContext,
  }: IGetPermissionsByUserInput): Promise<string[]> {
    return executeUseCase({
      useCase: this._getPermissionsByUser,
      requestContext,
    });
  }

  async getRoleByUser({
    input,
    requestContext,
  }: IGetRoleByUserInput): Promise<string> {
    return executeUseCase({
      useCase: this._getRoleByUser,
      input,
      requestContext,
    });
  }
}
