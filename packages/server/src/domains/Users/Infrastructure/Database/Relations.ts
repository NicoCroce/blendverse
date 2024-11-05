import { CompaniesModel } from '@server/domains/Companies/Infrastructure';
import { UserScheme } from './Users.scheme';

CompaniesModel.hasMany(UserScheme, { foreignKey: 'id_propietario' });
UserScheme.belongsTo(CompaniesModel, { foreignKey: 'id_propietario' });
