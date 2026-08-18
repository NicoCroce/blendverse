import { IUseCase } from '@server/Application';
import { SegmentsRepository, SegmentType } from '../../Domain';
import { IGetSegmentTypes } from '../segments.types';

export class GetSegmentTypes implements IUseCase<SegmentType[]> {
  constructor(private readonly segmentsRepository: SegmentsRepository) {}

  async execute({ requestContext }: IGetSegmentTypes): Promise<SegmentType[]> {
    return this.segmentsRepository.getSegmentTypes({ requestContext });
  }
}
