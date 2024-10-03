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

  getUser = async (id: number) => {
    await delay();
    return Users.find((user) => user.id === id);
  };

  validateUserById = async (id: number) => {
    await delay();
    return Users.find((u) => u.id === id);
  };

  validateUserByMail = async (mail: string) => {
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
      id: Users.length + 1,
      mail,
      name,
      password,
      userImage:
        'https://media.licdn.com/media/AAYQAQSOAAgAAQAAAAAAAB-zrMZEDXI2T62PSuT6kpB6qg.png',
      companyLogo:
        'https://media.licdn.com/dms/image/v2/C560EAQFi2OGWfxI4qA/rightRail-logo-shrink_200_200/rightRail-logo-shrink_200_200/0/1630998002580?e=1728522000&v=beta&t=SlHmEK_Z3rKJWOcqgW_aH2BPuj_c33yarTSrjr6gu6s',
      companyName: 'LinkedIn',
    };

    Users.push(newUser);

    return newUser;
  };

  updateUser = async ({
    id,
    name,
    mail,
  }: {
    id: number;
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

  deleteUser = async (id: number) => {
    const userIndex = Users.findIndex((user) => user.id === id);
    if (userIndex === -1) return null;
    const response = Users[userIndex];
    Users.splice(userIndex, 1);

    return response;
  };
}
