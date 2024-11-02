import { usersController } from '../../user.app';

export const UserRoutes = () => {
  const {
    getUsers,
    getUser,
    registerUser,
    deleteUser,
    updateUser,
    changePassword,
  } = usersController();

  return {
    users: {
      getAll: getUsers,
      create: registerUser,
      get: getUser,
      delete: deleteUser,
      update: updateUser,
      changePassword,
    },
  };
};
