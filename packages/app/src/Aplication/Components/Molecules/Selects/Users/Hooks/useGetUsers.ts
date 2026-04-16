import { TUserRouter } from '@server/domains/Users';
import { createTRPCReact } from '@trpc/react-query';

const _usersService = createTRPCReact<TUserRouter>();
const UsersService = _usersService.users;

export type TUserSearch = {
  nombre?: string;
};

export const useGetUsers = () => {
  return UsersService.getSelect.useQuery();
};
