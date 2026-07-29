import { TSegmentsRouter } from '@server/domains/Segments';
import { createTRPCReact } from '@trpc/react-query';

const _segmentsService = createTRPCReact<TSegmentsRouter>();
export const segmentsTRPC = _segmentsService;
export const segmentsService = _segmentsService.segments;

export const useGetSegmentTypes = () =>
  segmentsService.getTypes.useQuery(undefined, {
    staleTime: 30000,
  });

export const useGetSegmentTypesEnabled = (enabled: boolean) =>
  segmentsService.getTypes.useQuery(undefined, {
    staleTime: 30000,
    enabled,
  });

export type TuseGetSegmentTypes = ReturnType<typeof useGetSegmentTypes>;

export const useCreateSegmentType = () => {
  const utils = segmentsTRPC.useUtils();
  return segmentsService.createType.useMutation({
    onSuccess: () => {
      utils.segments.getTypes.invalidate();
    },
  });
};

export const useUpdateSegmentType = () => {
  const utils = segmentsTRPC.useUtils();
  return segmentsService.updateType.useMutation({
    onSuccess: () => {
      utils.segments.getTypes.invalidate();
    },
  });
};

export const useDeleteSegmentType = () => {
  const utils = segmentsTRPC.useUtils();
  return segmentsService.deleteType.useMutation({
    onSuccess: () => {
      utils.segments.getTypes.invalidate();
    },
  });
};

export const useGetUserSegments = (input: { userId: number }) =>
  segmentsService.getUserSegments.useQuery(input);

export const useAssignSegmentToUser = () =>
  segmentsService.assignToUser.useMutation();

export const useRemoveSegmentFromUser = () =>
  segmentsService.removeFromUser.useMutation();

export const useGetUsersBySegments = (
  input: { segmentIds: number[] },
  options?: { enabled?: boolean },
) =>
  segmentsService.getBySegments.useQuery(input, {
    staleTime: 10000,
    ...options,
  });
