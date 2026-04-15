import { AppError, IUseCase } from '@server/Application';
import { OwnersyssRepository, Ownersys, IGetOwnersys } from '../../Domain';

export class GetOwnersys implements IUseCase<Ownersys | null> {
  constructor(private readonly ownersyssRepository: OwnersyssRepository) {}

  async execute({
    input,
    requestContext,
  }: IGetOwnersys): Promise<Ownersys | null> {
    const id = input;
    const ownersys = await this.ownersyssRepository.getOwnersys({
      id,
      requestContext,
    });

    if (!ownersys) throw new AppError('Registro no encontrado', 404);
    return ownersys;
  }
}
