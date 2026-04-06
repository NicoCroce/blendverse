import { TPricelisttypeRouter } from '@server/domains/Pricelisttypes';
import { createTRPCReact } from '@trpc/react-query';

const _pricelisttypesService = createTRPCReact<TPricelisttypeRouter>();
const PricelisttypesService = _pricelisttypesService.pricelisttypes;

export type TPricelisttypeSearch = {
  denominacion?: string;
};

export const useGetPricelisttypes = () => {
  return PricelisttypesService.getSelect.useQuery();
};
