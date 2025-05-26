import { TStreetRouter } from '@server/domains/Streets';
import { createTRPCReact } from '@trpc/react-query';

const _streetsService = createTRPCReact<TStreetRouter>();
const StreetsService = _streetsService.streets;

export type TStreetSearch = {
  denominacion?: string;
};

export const useGetAllStreets = () => {
  return StreetsService.getAll.useQuery(undefined, {
    staleTime: 10000,
  });
};
