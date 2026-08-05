import { _segmentsService, SegmentsService } from '../Segments.service';

export const useDeleteSegmentType = () => {
  const utils = _segmentsService.useUtils();
  return SegmentsService.deleteType.useMutation({
    onSuccess: () => {
      utils.segments.getTypes.invalidate();
    },
  });
};
