import { SegmentsService } from '../Segments.service';

export const useGetUserSegments = (input: { userId: number }) =>
  SegmentsService.getUserSegments.useQuery(input);
