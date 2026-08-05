import { TSegmentsRouter } from '@server/domains/Segments';
import { createTRPCReact } from '@trpc/react-query';

export const _segmentsService = createTRPCReact<TSegmentsRouter>();
export const SegmentsService = _segmentsService.segments;
