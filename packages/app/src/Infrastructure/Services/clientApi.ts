import { TMainRouter } from '@server/Infrastructure/Routes/Router';
import { createTRPCReact, httpLink } from '@trpc/react-query';
import { URL_SERVER } from './Services';

export const TrpcApi = createTRPCReact<TMainRouter>();

export const trpcClientApi = TrpcApi.createClient({
  links: [
    httpLink({
      url: URL_SERVER + '/api',
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
    }),
  ],
});
