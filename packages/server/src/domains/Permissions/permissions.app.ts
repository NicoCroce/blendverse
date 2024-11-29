import { container } from '@server/utils/Container';
import { asClass } from 'awilix';
import { PermissionsController } from './Infrastructure/Controllers';
import { GetPermissions, GetPermissionsByUser, GetRoles } from './Domain';
import { PermissionsService } from './Aplication';
import { PermissionsRepositoryImplementation } from './Infrastructure';

export const permissionsApp = {
  permissionsRepository: asClass(PermissionsRepositoryImplementation),
  permissionsService: asClass(PermissionsService),
  permissionsController: asClass(PermissionsController),
  _getPermissions: asClass(GetPermissions),
  _getRoles: asClass(GetRoles),
  _getPermissionsByUser: asClass(GetPermissionsByUser),
};

export const permissionsController = () =>
  container.resolve<PermissionsController>('permissionsController');
