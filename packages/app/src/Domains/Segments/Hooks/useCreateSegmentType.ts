import { _segmentsService, SegmentsService } from '../Segments.service';

export const useCreateSegmentType = () => {
  const utils = _segmentsService.useUtils();
  return SegmentsService.createType.useMutation({
    onSuccess: () => {
      utils.segments.getTypes.invalidate();
    },
  });
};
