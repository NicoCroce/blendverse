import { IEmpresasUsuariosRepository } from '../../Domain/EmpresasUsuarios.repository';
import { EmpresaUsuario } from '../../Domain/EmpresasUsuarios.entity';
import { EmpresasUsuariosModel } from './EmpresasUsuarios.model';
import { OwnersysModel } from '@server/domains/Ownersyss/Infrastructure/Database/Ownersys.model';

export class EmpresasUsuariosRepositoryImplementation implements IEmpresasUsuariosRepository {
  async belongsToEmpresa(userId: number, empresaId: number): Promise<boolean> {
    const count = await EmpresasUsuariosModel.count({
      where: { id_usuario: userId, id_empresa: empresaId },
    });
    return count > 0;
  }

  async findByUsuario(userId: number): Promise<EmpresaUsuario[]> {
    const rows = await EmpresasUsuariosModel.findAll({
      where: { id_usuario: userId },
      include: [
        {
          model: OwnersysModel,
          as: 'Empresa',
          attributes: ['id', 'denominacion', 'logo'],
        },
      ],
    });

    return rows.map((row) =>
      EmpresaUsuario.create({
        id: row.id,
        id_empresa: row.id_empresa,
        id_usuario: row.id_usuario,
        denominacion: row.Empresa?.denominacion,
        logo: row.Empresa?.logo ?? null,
      }),
    );
  }
}
