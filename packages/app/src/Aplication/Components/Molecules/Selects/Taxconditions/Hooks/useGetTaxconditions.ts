import { TTaxconditionRouter } from '@server/domains/Taxconditions';
import { createTRPCReact } from '@trpc/react-query';

const _taxconditionsService = createTRPCReact<TTaxconditionRouter>();
const TaxconditionsService = _taxconditionsService.taxconditions;

export type TTaxconditionSearch = {
  denominacion?: string;
};

export const useGetTaxconditions = () => {
  return TaxconditionsService.getSelect.useQuery();
};
