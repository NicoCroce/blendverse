import { router } from '@server/Infrastructure/trpc';
import { OwnersysRoutes } from './OwnersysRoutes';

const OwnersysRouter = () => router(OwnersysRoutes());
export type TOwnersysRouter = ReturnType<typeof OwnersysRouter>;
