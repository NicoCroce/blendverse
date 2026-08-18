import { UserModel } from '@server/domains/Users';
import { DisclaimerAcceptanceModel } from './DisclaimerAcceptance.model';

export const relateDisclaimer = () => {
  UserModel.hasOne(DisclaimerAcceptanceModel, {
    foreignKey: 'id_usuario',
    as: 'DisclaimerAcceptance',
  });
  DisclaimerAcceptanceModel.belongsTo(UserModel, {
    foreignKey: 'id_usuario',
    as: 'user',
  });
};
