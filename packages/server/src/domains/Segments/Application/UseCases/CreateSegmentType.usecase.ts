import { IUseCase } from '@server/Application';
import { SegmentsRepository, SegmentType } from '../../Domain';
import { ICreateSegmentType } from '../segments.types';

export class CreateSegmentType implements IUseCase<SegmentType> {
  constructor(private readonly segmentsRepository: SegmentsRepository) {}

  async execute({
    input,
    requestContext,
  }: ICreateSegmentType): Promise<SegmentType> {
    return this.segmentsRepository.createSegmentType({
      nombre: input.nombre,
      requestContext,
    });
  }
}
