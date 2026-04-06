import { TCustomerRouter } from '@server/domains/Customers';
import { createTRPCReact } from '@trpc/react-query';

const _customersService = createTRPCReact<TCustomerRouter>();
const CustomersService = _customersService.customers;

export type TCustomerSearch = {
  denominacion?: string;
};

export const useGetCustomers = (search: string) => {
  return CustomersService.getSelect.useQuery(
    { denominacion: search },
    {
      staleTime: 10000,
      enabled: !!search && search.length >= 2,
    },
  );
};
