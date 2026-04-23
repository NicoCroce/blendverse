import { ownersyssController } from '../../ownersys.app';

export const OwnersysRoutes = () => {
  const { updateTheme, getOwnerTheme, getOwnersys } = ownersyssController();

  return {
    ownersyss: {
      get: getOwnersys(),

      changeTheme: updateTheme(),
      getOwnerTheme: getOwnerTheme(),
    },
  };
};
