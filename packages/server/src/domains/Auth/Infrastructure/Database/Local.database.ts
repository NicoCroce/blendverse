import { Auth } from '@server/data';
import { delay } from '@server/utils/Utils';

export class LocalDatabaseUser {
  getAuthList = async () => {
    await delay();
    return Auth;
  };

  getAuth = async (username: string) => {
    await delay();
    return Auth.find((user) => user.username === username) || null;
  };

  addUserAuth = async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    await delay();

    const newUser = {
      id: String(Auth.length),
      username,
      password,
    };

    Auth.push(newUser);

    return newUser;
  };
}
