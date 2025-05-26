import { IUseCase } from '@server/Application';
import { Street } from '../Streets.entity';
import { StreetsRepository } from '../Streets.repository';
import { IGetAllStreets } from '../Streets.interfaces';

export class GetAllStreets implements IUseCase<Street[]> {
  constructor(private readonly streetsRepository: StreetsRepository) {}

  async execute({ input, requestContext }: IGetAllStreets): Promise<Street[]> {
    return this.streetsRepository.getAllStreets({
      filters: input,
      requestContext,
    });
  }
}
