import { usersController } from '../../user.app';

const { getAllUsers, getUser, registerUser } = usersController;

export const UserRoutes = {
  users: {
    getAll: getAllUsers,
    create: registerUser,
    get: getUser,
  },
};
