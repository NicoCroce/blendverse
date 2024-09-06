import { router } from '@server/Infrastructure/trpc';
import { AuthRoutes } from './AuthRoutes';

const AuthRouter = router(AuthRoutes);
export type TAuthRouter = typeof AuthRouter;
