import { TPostalcodeRouter } from '@server/domains/Postalcodes';
import { createTRPCReact } from '@trpc/react-query';

const _postalcodesService = createTRPCReact<TPostalcodeRouter>();
const PostalcodesService = _postalcodesService.postalcodes;

export type TPostalcodeSearch = {
  denominacion?: string;
};

export const useGetPostalcodes = (search: string) => {
  return PostalcodesService.getSelect.useQuery(
    { denominacion: search },
    {
      staleTime: 10000,
      enabled: !!search && search.length >= 2,
    },
  );
};
