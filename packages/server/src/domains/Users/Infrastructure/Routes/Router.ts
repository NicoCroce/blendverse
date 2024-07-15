import {
  createContext,
  router,
  trpcExpress,
} from '@server/Infrastructure/trpc';
import { UserRoutes } from './UserRoutes';
import { Express } from 'express';
import { USER_URL_PATH } from '../../user.config';

const UserRouter = router(UserRoutes);

const InstanceUserRouter = (app: Express) => {
  app.use(
    USER_URL_PATH,
    trpcExpress.createExpressMiddleware({
      router: UserRouter,
      createContext,
    }),
  );
};

export type TUserRouter = typeof UserRouter;
export { InstanceUserRouter };
