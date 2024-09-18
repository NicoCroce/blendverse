import { TUserRouter } from '@server/domains/Users';
import { createTRPCReact } from '@trpc/react-query';

export const _usersService = createTRPCReact<TUserRouter>();
export const UsersService = _usersService.users;
