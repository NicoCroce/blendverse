import { TOwnersysRouter } from '@server/domains/Ownersyss';
import { createTRPCReact } from '@trpc/react-query';

const _ownersyssService = createTRPCReact<TOwnersysRouter>();
const OwnersyssService = _ownersyssService.ownersyss;

export type TOwnersysSearch = {
  denominacion?: string;
};

export const useGetOwnersyss = (search: string) => {
  return OwnersyssService.getSelect.useQuery(
    { denominacion: search },
    {
      staleTime: 10000,
      enabled: !!search && search.length >= 2,
    },
  );
};
