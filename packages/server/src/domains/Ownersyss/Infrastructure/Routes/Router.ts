import { router } from '@server/Infrastructure/trpc';
import { OwnersysRoutes } from './Ownersyss.routes';

const _OwnersysRouter = () => router(OwnersysRoutes());
export type TOwnersysRouter = ReturnType<typeof _OwnersysRouter>;
