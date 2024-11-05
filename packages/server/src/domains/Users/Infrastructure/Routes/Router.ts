import { router } from '@server/Infrastructure/trpc';
import { UserRoutes } from './UserRoutes';

const UserRouter = () => router(UserRoutes());
export type TUserRouter = ReturnType<typeof UserRouter>;
