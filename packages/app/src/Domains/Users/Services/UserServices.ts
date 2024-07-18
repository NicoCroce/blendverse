import { TUserRouter } from '@server/domains/Users';
import { USER_URL_PATH } from '@server/domains/Users/user.config';
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import { URL_SERVER } from '@app/Infrastructure/Services';

export const UsersServices = createTRPCReact<TUserRouter>();

export const UsersServicesClient = UsersServices.createClient({
  links: [
    httpBatchLink({
      url: URL_SERVER + USER_URL_PATH,
    }),
  ],
});
