import { router } from './TrpcInstance';
import { UsersRoutes } from '@server/domains/Users/Routes';

const AppRouter = router({
  ...UsersRoutes,
});

export type TAppRouter = typeof AppRouter;

export { AppRouter };
