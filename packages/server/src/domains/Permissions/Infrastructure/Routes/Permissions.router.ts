import { router } from '@server/Infrastructure';
import { PermissionsRoutes } from './Permissions.routes';

const PermissionsRouter = () => router(PermissionsRoutes());
export type TPermissionsRouter = ReturnType<typeof PermissionsRouter>;
