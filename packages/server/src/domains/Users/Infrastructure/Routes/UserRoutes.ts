import { usersController } from '../../user.app';

const { getAllUsers, getUser, registerUser, deleteUser, updateUser } =
  usersController;

export const UserRoutes = {
  users: {
    getAll: getAllUsers,
    create: registerUser,
    get: getUser,
    delete: deleteUser,
    update: updateUser,
  },
};
