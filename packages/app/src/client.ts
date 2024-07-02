import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { TAppRouter } from '@blendverse/server/src/trpc/Routes';

export const Trpc = createTRPCReact<TAppRouter>();
export const trpcClient = Trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:5500/trpc',
    }),
  ],
});

/* export const getUserList = () => trpcClient.userList.query();

export const addUser = (user: string) => trpc.userCreate.mutate({ name: user }); */
