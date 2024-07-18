import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import { TUserRouter } from '@blendverse/server/src/domains/Users';
import { USER_URL_PATH } from '@server/domains/Users/user.config';

export const Trpc = createTRPCReact<TUserRouter>();
export const trpcClient = Trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:5500' + USER_URL_PATH,
    }),
  ],
});
