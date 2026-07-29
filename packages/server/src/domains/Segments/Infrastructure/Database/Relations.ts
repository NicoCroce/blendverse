import { UserModel } from '@server/domains/Users/Infrastructure/Database';
import { TiposSegmentosModel } from './TiposSegmentos.model';
import { UsuariosSegmentosModel } from './UsuariosSegmentos.model';

export const relateSegments = () => {
  // TiposSegmentos → UsuariosSegmentos
  TiposSegmentosModel.hasMany(UsuariosSegmentosModel, {
    foreignKey: 'id_segmento',
  });
  UsuariosSegmentosModel.belongsTo(TiposSegmentosModel, {
    foreignKey: 'id_segmento',
  });

  // UsuariosSegmentos → User
  UsuariosSegmentosModel.belongsTo(UserModel, { foreignKey: 'id_usuario' });

  // TiposSegmentos ↔ User (through UsuariosSegmentos)
  TiposSegmentosModel.belongsToMany(UserModel, {
    through: UsuariosSegmentosModel,
    foreignKey: 'id_segmento',
    otherKey: 'id_usuario',
  });
};
