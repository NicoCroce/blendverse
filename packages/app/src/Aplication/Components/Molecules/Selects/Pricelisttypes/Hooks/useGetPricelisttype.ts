import { TPricelisttypeRouter } from '@server/domains/Pricelisttypes';
import { createTRPCReact } from '@trpc/react-query';

const _pricelisttypesService = createTRPCReact<TPricelisttypeRouter>();
const PricelisttypesService = _pricelisttypesService.pricelisttypes;

export const useGetPricelisttype = (id?: number) => {
  return PricelisttypesService.get.useQuery(id || 0, {
    enabled: !!id && id > 0,
  });
};
