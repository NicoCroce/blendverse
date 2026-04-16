import { IUseCase } from '@server/Application';
import { OwnersyssRepository, IGetOwnerTheme } from '../../Domain';

export class GetOwnerTheme implements IUseCase<number> {
  constructor(private readonly ownersyssRepository: OwnersyssRepository) {}

  async execute({ requestContext }: IGetOwnerTheme): Promise<number> {
    const tema = await this.ownersyssRepository.getOwnerTheme({
      requestContext,
    });

    if (tema === null) {
      return 1;
    }

    return tema;
  }
}
