import { Express } from 'express';
import { UserRoutes } from '@server/domains/Users';
import { router, trpcExpress, createContext } from '../trpc';
import { AuthRoutes } from '@server/domains/Auth';
import { PermissionsRoutes } from '@server/domains/Permissions';
import { OwnersysRoutes } from '@server/domains/Ownersyss';
import { ProfileRoutes } from '@server/domains/Profiles';
import { UserprofileRoutes } from '@server/domains/Userprofiles';
import { ThemeRoutes } from '@server/domains/Themes';

const MainRouter = () => {
  const AllRouters = {
    ...OwnersysRoutes(),
    ...UserRoutes(),
    ...AuthRoutes(),
    ...PermissionsRoutes(),
    ...ProfileRoutes(),
    ...UserprofileRoutes(),
    ...ThemeRoutes(),
  };
  return router(AllRouters);
};

const InstanceMainRouter = (app: Express) => {
  app.use(
    '/api',
    trpcExpress.createExpressMiddleware({
      router: MainRouter(),
      createContext,
    }),
  );
};

export type TMainRouter = ReturnType<typeof MainRouter>;
export { InstanceMainRouter };
