import { streetsController } from '../../street.app';

export const StreetRoutes = () => {
  const { getAllStreets, createStreet, deleteStreet, getStreet, updateStreet } =
    streetsController();

  return {
    streets: {
      getAll: getAllStreets,
      create: createStreet,
      get: getStreet,
      delete: deleteStreet,
      update: updateStreet,
    },
  };
};
