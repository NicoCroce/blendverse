import { IUseCase } from '@server/Application';
import { SegmentsRepository } from '../../Domain';
import { IRemoveSegmentFromUser } from '../segments.types';

export class RemoveSegmentFromUser implements IUseCase<void> {
  constructor(private readonly segmentsRepository: SegmentsRepository) {}

  async execute({
    input,
    requestContext,
  }: IRemoveSegmentFromUser): Promise<void> {
    return this.segmentsRepository.removeSegmentFromUser({
      userId: input.userId,
      segmentId: input.segmentId,
      requestContext,
    });
  }
}
