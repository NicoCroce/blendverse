import { IUseCase } from '@server/Application';
import { SegmentsRepository } from '../../Domain';
import { IDeleteSegmentType } from '../segments.types';

export class DeleteSegmentType implements IUseCase<void> {
  constructor(private readonly segmentsRepository: SegmentsRepository) {}

  async execute({ input, requestContext }: IDeleteSegmentType): Promise<void> {
    return this.segmentsRepository.deleteSegmentType({
      id: input.id,
      requestContext,
    });
  }
}
