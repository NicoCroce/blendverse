import { inferRouterOutputs } from '@trpc/server';
import { TSegmentsRouter } from '@server/domains/Segments';

type TSegmentsRouterOutput = inferRouterOutputs<TSegmentsRouter>;

export type TSegmentType =
  TSegmentsRouterOutput['segments']['getTypes'][number];
