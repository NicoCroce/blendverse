import { router } from '@server/Infrastructure';
import { PermissionsRoutes } from './Permissions.routes';

const _PermissionsRouter = () => router(PermissionsRoutes());
export type TPermissionsRouter = ReturnType<typeof _PermissionsRouter>;
