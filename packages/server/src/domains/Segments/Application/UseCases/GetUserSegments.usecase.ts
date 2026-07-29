import { IUseCase } from '@server/Application';
import { SegmentsRepository, SegmentType } from '../../Domain';
import { IGetUserSegments } from '../segments.types';

export class GetUserSegments implements IUseCase<SegmentType[]> {
  constructor(private readonly segmentsRepository: SegmentsRepository) {}

  async execute({
    input,
    requestContext,
  }: IGetUserSegments): Promise<SegmentType[]> {
    return this.segmentsRepository.getUserSegments({
      userId: input.userId,
      requestContext,
    });
  }
}
