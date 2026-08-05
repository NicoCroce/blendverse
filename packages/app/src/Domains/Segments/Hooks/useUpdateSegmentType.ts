import { _segmentsService, SegmentsService } from '../Segments.service';

export const useUpdateSegmentType = () => {
  const utils = _segmentsService.useUtils();
  return SegmentsService.updateType.useMutation({
    onSuccess: () => {
      utils.segments.getTypes.invalidate();
    },
  });
};
