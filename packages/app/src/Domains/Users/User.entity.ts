import { TPagination } from '@app/Application';
import { IUser } from '@server/domains/Users';

export type TUser = IUser;

export type TUserLogged = IUser & {
  theme: number;
};

export type TUserSearch = {
  name: string;
} & TPagination;
