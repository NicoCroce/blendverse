import { AppError, IUseCase } from '@server/Application';
import { StreetsRepository } from '../Streets.repository';
import { ICreateStreet } from '../Streets.interfaces';
import { Street } from '../Streets.entity';

export class CreateStreet implements IUseCase<Street> {
  constructor(private readonly streetsRepository: StreetsRepository) {}

  async execute({ input, requestContext }: ICreateStreet): Promise<Street> {
    const { id, denominacion } = input;
    const newStreet = Street.create({
      denominacion,
      id,
    });
    const street = await this.streetsRepository.create({
      street: newStreet,
      requestContext,
    });

    if (!street) {
      throw new AppError('No se puede Ingresar Registro');
    }
    return street;
  }
}
