import { router } from '@server/Infrastructure/trpc';
import { SegmentsRoutes } from './Segments.routes';

const _SegmentsRouter = () => router(SegmentsRoutes());
export type TSegmentsRouter = ReturnType<typeof _SegmentsRouter>;
