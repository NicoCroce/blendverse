import { TPagination } from '@app/Aplication';
import { IUser } from '@server/domains/Users';

export type TUser = IUser;

export type TUserSearch = {
  name: string;
} & TPagination;
