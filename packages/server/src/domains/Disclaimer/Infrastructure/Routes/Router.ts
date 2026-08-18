import { router } from '@server/Infrastructure/trpc';
import { DisclaimerRoutes } from './Disclaimer.routes';

const _DisclaimerRouter = () => router(DisclaimerRoutes());
export type TDisclaimerRouter = ReturnType<typeof _DisclaimerRouter>;
