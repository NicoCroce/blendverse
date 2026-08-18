import { createTRPCReact } from '@trpc/react-query';
import { TDisclaimerRouter } from '@server/domains/Disclaimer';

export const _disclaimerService = createTRPCReact<TDisclaimerRouter>();
export const DisclaimerService = _disclaimerService.disclaimer;
