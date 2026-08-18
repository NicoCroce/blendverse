import { IUseCase } from '@server/Application';
import { SegmentsRepository, SegmentType } from '../../Domain';
import { IUpdateSegmentType } from '../segments.types';

export class UpdateSegmentType implements IUseCase<SegmentType> {
  constructor(private readonly segmentsRepository: SegmentsRepository) {}

  async execute({
    input,
    requestContext,
  }: IUpdateSegmentType): Promise<SegmentType> {
    return this.segmentsRepository.updateSegmentType({
      id: input.id,
      nombre: input.nombre,
      requestContext,
    });
  }
}
