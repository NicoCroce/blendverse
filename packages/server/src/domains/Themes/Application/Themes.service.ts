import { executeUseCase } from '@server/Application';
import { Theme, IGetAllThemes, IGetTheme } from '../Domain';
import { GetAllThemes, GetTheme } from './UseCases';

export class ThemesService {
  constructor(
    private readonly _getAllThemes: GetAllThemes,
    private readonly _getTheme: GetTheme,
  ) {}
  async getAllThemes({
    input,
    requestContext,
  }: IGetAllThemes): Promise<Theme[]> {
    return executeUseCase({
      useCase: this._getAllThemes,
      input,
      requestContext,
    });
  }

  async getTheme({ input, requestContext }: IGetTheme): Promise<Theme | null> {
    return executeUseCase({
      useCase: this._getTheme,
      input,
      requestContext,
    });
  }
}
