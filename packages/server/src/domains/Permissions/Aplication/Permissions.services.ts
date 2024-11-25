import { executeUseCase } from '@server/Application';
import {
  GetPermissions,
  GetRoles,
  IGetPermissions,
  IGetRoles,
  Permissions,
  Roles,
} from '../Domain';

export class PermissionsService {
  constructor(
    private readonly _getPermissions: GetPermissions,
    private readonly _getRoles: GetRoles,
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
}
