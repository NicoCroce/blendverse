import { Express } from 'express';
import { UserRoutes } from '@server/domains/Users';
import { router, trpcExpress, createContext } from '../trpc';
import { AuthRoutes } from '@server/domains/Auth';
import { PermissionsRoutes } from '@server/domains/Permissions';
import { DocumentsRoutes } from '@server/domains/Documents';
import { DocumentsTypesRoutes } from '@server/domains/DocumentsTypes';
import { CertificatesRoutes } from '@server/domains/Certificates/Infrastructure/Routes';
import { CertificatesRoutesExpress } from '@server/domains/Certificates/Infrastructure/Routes/CertificatesRoutesExpress';
import { OwnersysRoutes } from '@server/domains/Ownersyss';
import { ThemeRoutes } from '@server/domains/Themes';
import { EmpresasUsuariosRoutes } from '@server/domains/Empresas_usuarios';
import { DisclaimerRoutes } from '@server/domains/Disclaimer';
import { SegmentsRoutes } from '@server/domains/Segments';
import { DailyReportRoutes } from '@server/domains/DailyReport';

const MainRouter = () => {
  const AllRouters = {
    ...OwnersysRoutes(),
    ...UserRoutes(),
    ...AuthRoutes(),
    ...PermissionsRoutes(),
    ...DocumentsRoutes(),
    ...DocumentsTypesRoutes(),
    ...CertificatesRoutes(),
    ...ThemeRoutes(),
    ...EmpresasUsuariosRoutes(),
    ...DisclaimerRoutes(),
    ...SegmentsRoutes(),
    ...DailyReportRoutes(),
  };
  return router(AllRouters);
};

setTimeout(CertificatesRoutesExpress, 0);

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
