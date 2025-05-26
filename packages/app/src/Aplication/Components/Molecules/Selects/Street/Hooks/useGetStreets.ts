import { TStreetRouter } from '@server/domains/Streets';
import { createTRPCReact } from '@trpc/react-query';

const _streetsService = createTRPCReact<TStreetRouter>();
const StreetsService = _streetsService.streets;

export type TStreetSearch = {
  denominacion?: string;
};

export const useGetStreets = (search: string) => {
  return StreetsService.getAll.useQuery(
    { denominacion: search },
    {
      staleTime: 10000,
      enabled: !!search && search.length >= 2,
    },
  );
};
