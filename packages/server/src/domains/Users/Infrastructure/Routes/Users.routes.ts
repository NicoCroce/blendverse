import { usersController } from '../..';

export const UserRoutes = () => {
  const { changePassword } = usersController();

  return {
    users: {
      changePassword: changePassword(),
    },
  };
};
