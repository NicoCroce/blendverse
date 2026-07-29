import { IUseCase } from '@server/Application';
import { SegmentsRepository } from '../../Domain';
import { IAssignSegmentToUser } from '../segments.types';

export class AssignSegmentToUser implements IUseCase<void> {
  constructor(private readonly segmentsRepository: SegmentsRepository) {}

  async execute({
    input,
    requestContext,
  }: IAssignSegmentToUser): Promise<void> {
    return this.segmentsRepository.assignSegmentToUser({
      userId: input.userId,
      segmentId: input.segmentId,
      requestContext,
    });
  }
}
