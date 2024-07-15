import { Users } from '@server/data';
import { delay } from '@server/utils/Utils';

export class LocalDatabase {
  getUsersList = async () => {
    await delay();
    return Users;
  };

  getUser = async (id: string) => {
    await delay();
    return Users.find((user) => user.id === id);
  };

  addUser = async ({
    name,
    mail,
    password,
  }: {
    name: string;
    mail: string;
    password: string;
  }) => {
    await delay();

    const newUser = {
      id: String(Users.length),
      mail,
      name,
      password,
    };

    Users.push(newUser);

    return newUser;
  };
}
