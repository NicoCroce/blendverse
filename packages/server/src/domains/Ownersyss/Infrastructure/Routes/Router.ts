import { router } from '@server/Infrastructure/trpc';
import { OwnersysRoutes } from './Ownersyss.routes';

const OwnersysRouter = () => router(OwnersysRoutes());
export type TOwnersysRouter = ReturnType<typeof OwnersysRouter>;
