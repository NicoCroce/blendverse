import { createTRPCReact } from '@trpc/react-query';
import { TEmpresasUsuariosRouter } from '@server/domains/Empresas_usuarios';

export const _empresasUsuariosService =
  createTRPCReact<TEmpresasUsuariosRouter>();
export const EmpresasUsuariosService =
  _empresasUsuariosService.empresasUsuarios;
