import { CompaniesModel } from '@server/domains/Companies/Infrastructure';
import { UserModel } from './Users.model';
import {
  TiposSegmentosModel,
  UsuariosSegmentosModel,
} from '@server/domains/Segments/Infrastructure/Database';

export const relateUsers = () => {
  CompaniesModel.hasMany(UserModel, { foreignKey: 'id_propietario' });
  UserModel.belongsTo(CompaniesModel, { foreignKey: 'id_propietario' });

  // Relaciones con Segmentos (modelos movidos a Segments domain)
  UserModel.hasMany(UsuariosSegmentosModel, { foreignKey: 'id_usuario' });
  UserModel.belongsToMany(TiposSegmentosModel, {
    through: UsuariosSegmentosModel,
    foreignKey: 'id_usuario',
    otherKey: 'id_segmento',
  });
};
