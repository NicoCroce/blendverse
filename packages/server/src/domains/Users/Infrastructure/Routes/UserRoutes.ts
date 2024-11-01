import { container } from '@server/utils/Container';
import { UsersController } from '../Controllers';

export const UserRoutes = () => {
  const {
    getUsers,
    getUser,
    registerUser,
    deleteUser,
    updateUser,
    changePassword,
  } = container.resolve<UsersController>('usersController');

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
