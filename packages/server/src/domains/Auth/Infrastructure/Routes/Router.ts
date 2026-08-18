import { router } from '@server/Infrastructure/trpc';
import { AuthRoutes } from './AuthRoutes';

const _AuthRouter = () => router(AuthRoutes());
export type TAuthRouter = ReturnType<typeof _AuthRouter>;
