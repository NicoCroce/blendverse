import {
  AppError,
  executeUseCase,
  type RequestContext,
} from '@server/Application';
import { GetPermissionsByUser } from '@server/domains/Permissions/Application';

export const requireDashboardAccess = async (
  requestContext: RequestContext,
  getPermissionsByUser: GetPermissionsByUser,
): Promise<void> => {
  if (requestContext.values.userId === 0) return;

  const permissions = await executeUseCase({
    useCase: getPermissionsByUser,
    requestContext,
  });

  if (!permissions.includes('dashboard-access')) {
    throw new AppError('Acceso denegado', 403, 'FORBIDDEN');
  }
};
