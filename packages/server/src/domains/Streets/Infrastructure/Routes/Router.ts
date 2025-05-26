import { router } from '@server/Infrastructure/trpc';
import { StreetRoutes } from './StreetRoutes';

const StreetRouter = () => router(StreetRoutes());
export type TStreetRouter = ReturnType<typeof StreetRouter>;
