import { executeUseCase } from '@server/Application';

import {
  GetSegmentTypes,
  CreateSegmentType,
  UpdateSegmentType,
  DeleteSegmentType,
  GetUserSegments,
  AssignSegmentToUser,
  RemoveSegmentFromUser,
  GetUsersBySegments,
} from './UseCases';
import {
  IGetSegmentTypes,
  ICreateSegmentType,
  IUpdateSegmentType,
  IDeleteSegmentType,
  IGetUserSegments,
  IAssignSegmentToUser,
  IRemoveSegmentFromUser,
  IGetUsersBySegments,
} from './segments.types';

export class SegmentsService {
  constructor(
    private readonly _getSegmentTypes: GetSegmentTypes,
    private readonly _createSegmentType: CreateSegmentType,
    private readonly _updateSegmentType: UpdateSegmentType,
    private readonly _deleteSegmentType: DeleteSegmentType,
    private readonly _getUserSegments: GetUserSegments,
    private readonly _assignSegmentToUser: AssignSegmentToUser,
    private readonly _removeSegmentFromUser: RemoveSegmentFromUser,
    private readonly _getUsersBySegments: GetUsersBySegments,
  ) {}

  getSegmentTypes({ requestContext }: IGetSegmentTypes) {
    return executeUseCase({
      useCase: this._getSegmentTypes,
      requestContext,
    });
  }

  createSegmentType({ input, requestContext }: ICreateSegmentType) {
    return executeUseCase({
      useCase: this._createSegmentType,
      input,
      requestContext,
    });
  }

  updateSegmentType({ input, requestContext }: IUpdateSegmentType) {
    return executeUseCase({
      useCase: this._updateSegmentType,
      input,
      requestContext,
    });
  }

  deleteSegmentType({ input, requestContext }: IDeleteSegmentType) {
    return executeUseCase({
      useCase: this._deleteSegmentType,
      input,
      requestContext,
    });
  }

  getUserSegments({ input, requestContext }: IGetUserSegments) {
    return executeUseCase({
      useCase: this._getUserSegments,
      input,
      requestContext,
    });
  }

  assignSegmentToUser({ input, requestContext }: IAssignSegmentToUser) {
    return executeUseCase({
      useCase: this._assignSegmentToUser,
      input,
      requestContext,
    });
  }

  removeSegmentFromUser({ input, requestContext }: IRemoveSegmentFromUser) {
    return executeUseCase({
      useCase: this._removeSegmentFromUser,
      input,
      requestContext,
    });
  }

  getUsersBySegments({ input, requestContext }: IGetUsersBySegments) {
    return executeUseCase({
      useCase: this._getUsersBySegments,
      input,
      requestContext,
    });
  }
}
