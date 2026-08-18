import { SegmentsService } from '../Segments.service';

export const useGetSegmentTypes = () =>
  SegmentsService.getTypes.useQuery(undefined, {
    staleTime: 30000,
  });

export const useGetSegmentTypesEnabled = (enabled: boolean) =>
  SegmentsService.getTypes.useQuery(undefined, {
    staleTime: 30000,
    enabled,
  });

export type TuseGetSegmentTypes = ReturnType<typeof useGetSegmentTypes>;
