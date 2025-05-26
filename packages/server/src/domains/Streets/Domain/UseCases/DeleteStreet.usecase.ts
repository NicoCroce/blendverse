import { AppError, IUseCase } from '@server/Application';
import { IDeleteStreet } from '../Streets.interfaces';
import { StreetsRepository } from '../Streets.repository';

export class DeleteStreet implements IUseCase<number | null> {
  constructor(private readonly streetsRepository: StreetsRepository) {}

  async execute({
    input,
    requestContext,
  }: IDeleteStreet): Promise<number | null> {
    const id = input;
    const street = await this.streetsRepository.getStreet({
      id,
      requestContext,
    });
    if (street) {
      await this.streetsRepository.delete({
        id,
        requestContext,
      });
      return id;
    } else {
      throw new AppError('No se puede Borrar Registro');
    }
  }
}
