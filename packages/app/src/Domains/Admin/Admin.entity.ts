import { inferRouterOutputs } from '@trpc/server';
import { TDisclaimerRouter } from '@server/domains/Disclaimer';

type TDisclaimerRouterOutput = inferRouterOutputs<TDisclaimerRouter>;

export type TEmployee =
  TDisclaimerRouterOutput['disclaimer']['getEmployees']['data'][number];
