import { SegmentsService } from '../Segments.service';

export const useAssignSegmentToUser = () =>
  SegmentsService.assignToUser.useMutation();

export const useRemoveSegmentFromUser = () =>
  SegmentsService.removeFromUser.useMutation();
