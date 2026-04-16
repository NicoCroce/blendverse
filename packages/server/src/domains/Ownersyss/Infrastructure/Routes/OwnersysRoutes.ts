import { ownersyssController } from '../../ownersys.app';

export const OwnersysRoutes = () => {
  const {
    getAllOwnersyss,
    createOwnersys,
    deleteOwnersys,
    getOwnersys,
    updateOwnersys,
    getSelectOwnersys,
    updateTheme,
    getOwnerTheme,
  } = ownersyssController();

  return {
    ownersyss: {
      getAll: getAllOwnersyss(),
      getSelect: getSelectOwnersys(),
      create: createOwnersys(),
      get: getOwnersys(),
      delete: deleteOwnersys(),
      update: updateOwnersys(),
      changeTheme: updateTheme(),
      getOwnerTheme: getOwnerTheme(),
    },
  };
};
