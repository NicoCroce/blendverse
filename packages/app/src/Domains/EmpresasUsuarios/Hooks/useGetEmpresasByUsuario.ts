import { EmpresasUsuariosService } from '../EmpresasUsuarios.service';

export const useGetEmpresasByUsuario = (userId: number) => {
  return EmpresasUsuariosService.getByUsuario.useQuery({ userId });
};
