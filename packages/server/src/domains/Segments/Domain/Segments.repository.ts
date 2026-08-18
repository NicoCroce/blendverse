import { IRequestContext } from '@server/Application';

import { SegmentType } from './SegmentType.entity';

export type IGetSegmentTypesRepository = IRequestContext;

export interface ICreateSegmentTypeRepository extends IRequestContext {
  nombre: string;
}

export interface IUpdateSegmentTypeRepository extends IRequestContext {
  id: number;
  nombre: string;
}

export interface IDeleteSegmentTypeRepository extends IRequestContext {
  id: number;
}

export interface IGetUserSegmentsRepository extends IRequestContext {
  userId: number;
}

export interface IAssignSegmentToUserRepository extends IRequestContext {
  userId: number;
  segmentId: number;
}

export interface IRemoveSegmentFromUserRepository extends IRequestContext {
  userId: number;
  segmentId: number;
}

export interface IGetUsersBySegmentsRepository extends IRequestContext {
  segmentIds: number[];
}

export interface SegmentsRepository {
  getSegmentTypes(params: IGetSegmentTypesRepository): Promise<SegmentType[]>;

  createSegmentType(params: ICreateSegmentTypeRepository): Promise<SegmentType>;

  updateSegmentType(params: IUpdateSegmentTypeRepository): Promise<SegmentType>;

  deleteSegmentType(params: IDeleteSegmentTypeRepository): Promise<void>;

  getUserSegments(params: IGetUserSegmentsRepository): Promise<SegmentType[]>;

  assignSegmentToUser(params: IAssignSegmentToUserRepository): Promise<void>;

  removeSegmentFromUser(
    params: IRemoveSegmentFromUserRepository,
  ): Promise<void>;

  getUsersBySegments(params: IGetUsersBySegmentsRepository): Promise<number[]>;
}
