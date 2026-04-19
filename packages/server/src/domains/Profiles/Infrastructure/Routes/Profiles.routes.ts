import { profilesController } from '../../profile.app';

export const ProfileRoutes = () => {
  const {
    getAllProfiles,
    createProfile,
    deleteProfile,
    getProfile,
    updateProfile,
    getSelectProfile,
  } = profilesController();

  return {
    profiles: {
      getAll: getAllProfiles(),
      getSelect: getSelectProfile(),
      create: createProfile(),
      get: getProfile(),
      delete: deleteProfile(),
      update: updateProfile(),
    },
  };
};
