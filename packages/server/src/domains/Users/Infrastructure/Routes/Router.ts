import { router } from '@server/Infrastructure/trpc';
import { UserRoutes } from './UserRoutes';

const _UserRouter = () => router(UserRoutes());
export type TUserRouter = ReturnType<typeof _UserRouter>;
