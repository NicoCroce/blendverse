import { protectedProcedure } from '@server/Infrastructure';
import { SegmentsService } from '../../Application';
import { executeService, executeServiceAlone } from '@server/Application';
import {
  CreateSegmentTypeInputSchema,
  UpdateSegmentTypeInputSchema,
  DeleteSegmentTypeInputSchema,
  GetUserSegmentsInputSchema,
  AssignSegmentToUserInputSchema,
  RemoveSegmentFromUserInputSchema,
  GetUsersBySegmentsInputSchema,
} from '../../Application/segments.types';

export class SegmentsController {
  constructor(private readonly segmentsService: SegmentsService) {}

  getSegmentTypes = protectedProcedure.query(
    executeServiceAlone(
      this.segmentsService.getSegmentTypes.bind(this.segmentsService),
    ),
  );

  createSegmentType = protectedProcedure
    .input(CreateSegmentTypeInputSchema)
    .mutation(
      executeService(
        this.segmentsService.createSegmentType.bind(this.segmentsService),
      ),
    );

  updateSegmentType = protectedProcedure
    .input(UpdateSegmentTypeInputSchema)
    .mutation(
      executeService(
        this.segmentsService.updateSegmentType.bind(this.segmentsService),
      ),
    );

  deleteSegmentType = protectedProcedure
    .input(DeleteSegmentTypeInputSchema)
    .mutation(
      executeService(
        this.segmentsService.deleteSegmentType.bind(this.segmentsService),
      ),
    );

  getUserSegments = protectedProcedure
    .input(GetUserSegmentsInputSchema)
    .query(
      executeService(
        this.segmentsService.getUserSegments.bind(this.segmentsService),
      ),
    );

  assignSegmentToUser = protectedProcedure
    .input(AssignSegmentToUserInputSchema)
    .mutation(
      executeService(
        this.segmentsService.assignSegmentToUser.bind(this.segmentsService),
      ),
    );

  removeSegmentFromUser = protectedProcedure
    .input(RemoveSegmentFromUserInputSchema)
    .mutation(
      executeService(
        this.segmentsService.removeSegmentFromUser.bind(this.segmentsService),
      ),
    );

  getUsersBySegments = protectedProcedure
    .input(GetUsersBySegmentsInputSchema)
    .query(
      executeService(
        this.segmentsService.getUsersBySegments.bind(this.segmentsService),
      ),
    );
}
