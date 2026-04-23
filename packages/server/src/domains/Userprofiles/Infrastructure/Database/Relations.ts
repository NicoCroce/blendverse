import { ProfileModel } from '@server/domains/Profiles/';
import { UserprofileModel } from './Userprofile.model';
import { UserModel } from '@server/domains/Users';

export const relateUserprofiles = () => {
  ProfileModel.hasMany(UserprofileModel, { foreignKey: 'id_perfil' });
  UserprofileModel.belongsTo(ProfileModel, {
    foreignKey: 'id_perfil',
    as: 'Profile',
  });

  UserModel.hasMany(UserprofileModel, { foreignKey: 'id_usuario' });
  UserprofileModel.belongsTo(UserModel, {
    foreignKey: 'id_usuario',
    as: 'User',
  });
};
