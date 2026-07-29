import { segmentsController } from '../../segments.di';

export const SegmentsRoutes = () => {
  const {
    getSegmentTypes,
    createSegmentType,
    updateSegmentType,
    deleteSegmentType,
    getUserSegments,
    assignSegmentToUser,
    removeSegmentFromUser,
    getUsersBySegments,
  } = segmentsController();

  return {
    segments: {
      getTypes: getSegmentTypes,
      createType: createSegmentType,
      updateType: updateSegmentType,
      deleteType: deleteSegmentType,
      getUserSegments,
      assignToUser: assignSegmentToUser,
      removeFromUser: removeSegmentFromUser,
      getBySegments: getUsersBySegments,
    },
  };
};
