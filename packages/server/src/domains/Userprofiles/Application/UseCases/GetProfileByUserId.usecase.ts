import { IRequestContext, IUseCase } from '@server/Application';
import { UserprofilesRepository } from '../../Domain';

interface IGetProfileByUserId extends IRequestContext {
  input: number; // userId
}

export class GetProfileByUserId implements IUseCase<number | null> {
  constructor(
    private readonly userprofilesRepository: UserprofilesRepository,
  ) {}

  async execute({
    input: userId,
    requestContext,
  }: IGetProfileByUserId): Promise<number | null> {
    const modifiedContext = requestContext;
    modifiedContext.setUserId(userId);

    const profiles = await this.userprofilesRepository.getAllProfilesByUser({
      requestContext: modifiedContext,
    });

    if (
      !profiles ||
      profiles.length === 0 ||
      profiles[0].values.id_perfil === undefined
    ) {
      return null;
    }

    // Devolver el primer perfil (asumiendo un perfil por usuario)
    return profiles[0].values.id_perfil;
  }
}
