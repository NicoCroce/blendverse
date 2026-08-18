import { UserModel } from '@server/domains/Users';
import { Documentos } from './';
import { DocumentsTypesModel } from '@server/domains/DocumentsTypes/Infrastructure';

DocumentsTypesModel.hasMany(Documentos, { foreignKey: 'tipo' });
Documentos.belongsTo(DocumentsTypesModel, { foreignKey: 'tipo' });

UserModel.hasMany(Documentos, { foreignKey: 'Usuario_id' });
Documentos.belongsTo(UserModel, { foreignKey: 'Usuario_id' });
