import { userController } from '../../user.app';

export const UserRoutes = {
  userList: userController.getAllUsers(),
  userCreate: userController.registerUser(),
  userById: userController.getUser(),
};
