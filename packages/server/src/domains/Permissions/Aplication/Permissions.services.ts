import { executeUseCase } from '@server/Application';
import {
  GetPermissions,
  GetPermissionsByUser,
  GetRoles,
  IGetPermissions,
  IGetPermissionsByUser,
  IGetRoles,
  Permissions,
  Roles,
} from '../Domain';

export class PermissionsService {
  constructor(
    private readonly _getPermissions: GetPermissions,
    private readonly _getRoles: GetRoles,
    private readonly _getPermissionsByUser: GetPermissionsByUser,
  ) {}

  async getPermissions({
    requestContext,
  }: IGetPermissions): Promise<Permissions[]> {
    return executeUseCase({
      useCase: this._getPermissions,
      requestContext,
    });
  }

  async getRoles({ requestContext }: IGetRoles): Promise<Roles[]> {
    return executeUseCase({
      useCase: this._getRoles,
      requestContext,
    });
  }

  async getPermissionsByUser({
    requestContext,
  }: IGetPermissionsByUser): Promise<string[]> {
    return executeUseCase({
      useCase: this._getPermissionsByUser,
      requestContext,
    });
  }
}
