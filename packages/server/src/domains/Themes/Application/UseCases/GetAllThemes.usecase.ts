import { IUseCase } from '@server/Application';
import { Theme } from '../../Domain/Themes.entity';
import { ThemesRepository } from '../../Domain/Themes.repository';
import { IGetAllThemes } from '../../Domain/Themes.interfaces';

export class GetAllThemes implements IUseCase<Theme[]> {
  constructor(private readonly themesRepository: ThemesRepository) {}

  async execute({ input, requestContext }: IGetAllThemes): Promise<Theme[]> {
    return await this.themesRepository.getAllThemes({
      filters: input,
      requestContext,
    });
  }
}
