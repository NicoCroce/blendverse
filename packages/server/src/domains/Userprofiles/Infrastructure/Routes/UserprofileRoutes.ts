import { getUserprofilesController } from '../../userprofile.app';

export const UserprofileRoutes = () => {
  const {
    getAllUserprofiles,
    createUserprofile,
    deleteUserprofile,
    getUserprofile,
    updateUserprofile,
    getProfileByUserId,
  } = getUserprofilesController();

  return {
    userprofiles: {
      getAll: getAllUserprofiles(),
      create: createUserprofile(),
      get: getUserprofile(),
      delete: deleteUserprofile(),
      update: updateUserprofile(),
      getProfileByUserId: getProfileByUserId(),
    },
  };
};
