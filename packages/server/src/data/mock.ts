import { User } from '../trpc/User';
import { delay } from '../utils/Utils';

const Users: User[] = [
  {
    id: '0',
    name: 'nico',
    password: '123',
  },
];

export const getUsersList = async (): Promise<User[]> => {
  await delay();
  return Users;
};

export const getUser = async (id: string): Promise<User | undefined> => {
  await delay();
  return Users.find((user) => user.id === id);
};

export const addUser = async ({ name }: { name: string }): Promise<User[]> => {
  await delay();

  Users.push({
    id: String(Users.length),
    name,
    password: '123',
  });

  return Users;
};
