import { IUseCase } from '@server/Application';
import { SegmentsRepository } from '../../Domain';
import { IGetUsersBySegments } from '../segments.types';

export class GetUsersBySegments implements IUseCase<number[]> {
  constructor(private readonly segmentsRepository: SegmentsRepository) {}

  async execute({
    input,
    requestContext,
  }: IGetUsersBySegments): Promise<number[]> {
    return this.segmentsRepository.getUsersBySegments({
      segmentIds: input.segmentIds,
      requestContext,
    });
  }
}
