import { TMainRouter } from '@server/Infrastructure/Routes/Router';
import { createTRPCReact, httpLink } from '@trpc/react-query';
import { URL_SERVER } from './Services';

export const TrpcApi = createTRPCReact<TMainRouter>();
export const trpcClientApi = TrpcApi.createClient({
  links: [
    httpLink({
      url: URL_SERVER + '/api',
      headers() {
        return {
          Authorization:
            ' Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJ1c2VyIjoibmljb0AxMjMuY29tIiwiaWF0IjoxNzI1MzM0ODM4LCJleHAiOjE3Mjc5MjY4Mzh9.t_6nlI9dnnG88iZCMsuLHPqV8Yd67fNyH8zmGNAHHxw',
        };
      },
    }),
  ],
});
