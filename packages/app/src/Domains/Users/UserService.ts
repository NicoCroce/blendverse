import { TUserRouter } from '@server/domains/Users';
import { createTRPCReact } from '@trpc/react-query';

export const UsersService = createTRPCReact<TUserRouter>();
