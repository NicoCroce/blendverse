import { TDepositRouter } from '@server/domains/Deposits';
import { createTRPCReact } from '@trpc/react-query';

const _depositsService = createTRPCReact<TDepositRouter>();
const DepositsService = _depositsService.deposits;

export type TDepositSearch = {
  denominacion?: string;
};

export const useGetDeposits = (search: string) => {
  return DepositsService.getSelect.useQuery(
    { denominacion: search },
    {
      staleTime: 10000,
      enabled: !search || search.length >= 2,
    },
  );
};
