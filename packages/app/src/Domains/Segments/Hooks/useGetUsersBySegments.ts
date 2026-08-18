import { SegmentsService } from '../Segments.service';

export const useGetUsersBySegments = (
  input: { segmentIds: number[] },
  options?: { enabled?: boolean },
) =>
  SegmentsService.getBySegments.useQuery(input, {
    staleTime: 10000,
    ...options,
  });
