import { AppError, IUseCase } from '@server/Application';
import { StreetsRepository } from '../Streets.repository';
import { Street } from '../Streets.entity';
import { IGetStreet } from '../Streets.interfaces';

export class GetStreet implements IUseCase<Street | null> {
  constructor(private readonly streetsRepository: StreetsRepository) {}

  async execute({ input, requestContext }: IGetStreet): Promise<Street | null> {
    const id = input;
    const street = await this.streetsRepository.getStreet({
      id,
      requestContext,
    });

    if (!street) throw new AppError('Registro no encontrado', 404);
    return street;
  }
}
