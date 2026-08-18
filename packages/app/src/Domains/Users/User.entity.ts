import { inferRouterOutputs } from '@trpc/server';
import { TAuthRouter } from '@server/domains/Auth';
import { TPagination } from '@app/Application';

type TAuthOutput = inferRouterOutputs<TAuthRouter>;

export type TUserLogged = TAuthOutput['auth']['login'];
export type TUser = Omit<TUserLogged, 'theme'>;

export type TUserSearch = {
  name: string;
} & TPagination;
