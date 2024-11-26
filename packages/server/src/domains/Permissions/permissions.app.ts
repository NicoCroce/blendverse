import { container } from '@server/utils/Container';
import { asClass } from 'awilix';
import { PermissionsController } from './Infrastructure/Controllers';
import { GetPermissions, GetPermissionsByUser, GetRoles } from './Domain';
import { PermissionsService } from './Aplication';
import { PermissionsRepositoryImplementationLocal } from './Infrastructure/Database';

export const permissionsApp = {
  permissionsRepository: asClass(PermissionsRepositoryImplementationLocal),
  permissionsService: asClass(PermissionsService),
  permissionsController: asClass(PermissionsController),
  _getPermissions: asClass(GetPermissions),
  _getRoles: asClass(GetRoles),
  _getPermissionsByUser: asClass(GetPermissionsByUser),
};

export const permissionsController = () =>
  container.resolve<PermissionsController>('permissionsController');
