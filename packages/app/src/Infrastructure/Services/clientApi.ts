import { TMainRouter } from '@server/Infrastructure/Routes/Router';
import { createTRPCReact, httpLink } from '@trpc/react-query';
import { URL_SERVER } from './Services';

export const TrpcApi = createTRPCReact<TMainRouter>();

export const trpcClientApi = TrpcApi.createClient({
  links: [
    httpLink({
      url: URL_SERVER + '/api',
      fetch: async (
        url: URL | RequestInfo,
        options?: RequestInit,
      ): Promise<Response> => {
        try {
          const response = await fetch(url, {
            ...options,
            credentials: 'include', // Incluye cookies
          });

          if (response.status === 401) {
            // Redirige a la página de login si el error es 401
            window.location.href = '/';
            // Asegúrate de que siempre devuelvas una respuesta
            return new Response(null, { status: 401 });
          }

          return response;
        } catch (error) {
          console.error('Fetch error:', error);
          throw error; // Vuelve a lanzar el error para que tRPC pueda manejarlo
        }
      },
    }),
  ],
});
