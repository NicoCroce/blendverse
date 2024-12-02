import { CompaniesModel } from '@server/domains/Companies/Infrastructure';
import { UserModel } from './Users.model';

CompaniesModel.hasMany(UserModel, { foreignKey: 'id_propietario' });
UserModel.belongsTo(CompaniesModel, { foreignKey: 'id_propietario' });
