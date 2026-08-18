import { asClass } from 'awilix';
import { SegmentsService } from './Application/Segments.service';
import { SegmentsController } from './Infrastructure/Controllers/Segments.controller';
import { container } from '@server/Infrastructure/di/Container';
import {
  GetSegmentTypes,
  CreateSegmentType,
  UpdateSegmentType,
  DeleteSegmentType,
  GetUserSegments,
  AssignSegmentToUser,
  RemoveSegmentFromUser,
  GetUsersBySegments,
} from './Application';
import { SegmentsRepositoryImplementation } from './Infrastructure';

export const segmentsApp = {
  segmentsRepository: asClass(SegmentsRepositoryImplementation),
  segmentsService: asClass(SegmentsService),
  segmentsController: asClass(SegmentsController),
  _getSegmentTypes: asClass(GetSegmentTypes),
  _createSegmentType: asClass(CreateSegmentType),
  _updateSegmentType: asClass(UpdateSegmentType),
  _deleteSegmentType: asClass(DeleteSegmentType),
  _getUserSegments: asClass(GetUserSegments),
  _assignSegmentToUser: asClass(AssignSegmentToUser),
  _removeSegmentFromUser: asClass(RemoveSegmentFromUser),
  _getUsersBySegments: asClass(GetUsersBySegments),
};

export const segmentsController = () =>
  container.resolve<SegmentsController>('segmentsController');
