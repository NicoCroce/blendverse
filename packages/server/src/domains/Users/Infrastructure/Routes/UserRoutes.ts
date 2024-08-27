import { userController } from '../../user.app';

const { getAllUsers, getUser, registerUser } = userController;

export const UserRoutes = {
  users: {
    getAll: getAllUsers,
    create: registerUser,
    get: getUser,
  },
};
