import { EmpresaUsuario } from './EmpresasUsuarios.entity';

export interface IEmpresasUsuariosRepository {
  findByUsuario(userId: number): Promise<EmpresaUsuario[]>;
  belongsToEmpresa(userId: number, empresaId: number): Promise<boolean>;
}
