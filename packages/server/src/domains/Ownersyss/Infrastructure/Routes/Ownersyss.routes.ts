import { ownersyssController } from '../..';

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
