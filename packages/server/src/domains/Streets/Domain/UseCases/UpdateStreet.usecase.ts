import { AppError, IUseCase } from '@server/Application';
import { StreetsRepository } from '../Streets.repository';
import { IUpdateStreet } from '../Streets.interfaces';
import { Street } from '../Streets.entity';

export class UpdateStreet implements IUseCase<Street> {
  constructor(private readonly streetsRepository: StreetsRepository) {}

  async execute({ input, requestContext }: IUpdateStreet): Promise<Street> {
    const { id, denominacion } = input;
    const updStreet = Street.create({
      id,
      denominacion,
    });
    const idret = await this.streetsRepository.update({
      street: updStreet,
      requestContext,
    });

    if (!idret) {
      throw new AppError('No se pudo Actualizar Registro');
    }
    return updStreet;
  }
}
