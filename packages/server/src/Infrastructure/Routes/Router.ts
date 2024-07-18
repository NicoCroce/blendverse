import { Express } from 'express';
import { UserRoutes } from '@server/domains/Users';
import { router, trpcExpress, createContext } from '../trpc';
import { ProductRoutes } from '@server/domains/Products/Infrastructure';

const AllRouters = { ...UserRoutes, ...ProductRoutes };

const MainRouter = router(AllRouters);

const InstanceMainRouter = (app: Express) => {
  app.use(
    '/api',
    trpcExpress.createExpressMiddleware({ router: MainRouter, createContext }),
  );
};

export type TMainRouter = typeof MainRouter;
export { InstanceMainRouter };
