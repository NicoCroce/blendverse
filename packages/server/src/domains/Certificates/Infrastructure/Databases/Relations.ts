import { UserModel } from '@server/domains/Users';
import { CertificateModel } from './Certificates.model';
import { CertificatesTypesModel } from './CertificatesTypes.model';

CertificatesTypesModel.hasMany(CertificateModel, {
  foreignKey: 'id_tipo_certificado',
});
CertificateModel.belongsTo(CertificatesTypesModel, {
  foreignKey: 'id_tipo_certificado',
});

CertificateModel.belongsTo(UserModel, { foreignKey: 'id_usuario', as: 'User' });
UserModel.hasMany(CertificateModel, { foreignKey: 'id_usuario' });
