import { Users } from '@server/data';
import { delay } from '@server/utils/Utils';

type TGetUsersList = {
  name?: string;
};

export class LocalDatabase {
  getUsersList = async (filters?: TGetUsersList) => {
    await delay();
    if (!filters?.name) return Users;
    return Users.filter((user) =>
      user.name.includes(filters?.name?.toLowerCase() || ''),
    );
  };

  getUser = async (id: string) => {
    await delay();
    return Users.find((user) => user.id === id);
  };

  validateUser = async (mail: string) => {
    await delay();
    return Users.find((u) => u.mail === mail);
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

  updateUser = async ({
    id,
    name,
    mail,
  }: {
    id: string;
    name: string;
    mail: string;
  }) => {
    const userIndex = Users.findIndex((user) => user.id === id);
    if (userIndex === -1) return null;
    Users[userIndex] = {
      ...Users[userIndex],
      id,
      name,
      mail,
    };

    return Users[userIndex];
  };

  deleteUser = async (id: string) => {
    const userIndex = Users.findIndex((user) => user.id === id);
    if (userIndex === -1) return null;
    const response = Users[userIndex];
    Users.splice(userIndex, 1);

    return response;
  };
}
