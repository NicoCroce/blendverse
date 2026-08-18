import { router } from '@server/Infrastructure/trpc';
import { EmpresasUsuariosRoutes } from './EmpresasUsuarios.routes';

const _EmpresasUsuariosRouter = () => router(EmpresasUsuariosRoutes());
export type TEmpresasUsuariosRouter = ReturnType<
  typeof _EmpresasUsuariosRouter
>;
