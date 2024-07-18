import { TMainRouter } from '@server/Infrastructure/Routes/Router';
import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
import { URL_SERVER } from './Infrastructure/Services';

export const TrpcApi = createTRPCReact<TMainRouter>();
export const trpcClientApi = TrpcApi.createClient({
  links: [
    httpBatchLink({
      url: URL_SERVER + '/api',
    }),
  ],
});
