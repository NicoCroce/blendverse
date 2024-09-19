import { usersController } from '../../user.app';

const { getUsers, getUser, registerUser, deleteUser, updateUser } =
  usersController;

export const UserRoutes = {
  users: {
    getAll: getUsers,
    create: registerUser,
    get: getUser,
    delete: deleteUser,
    update: updateUser,
  },
};
