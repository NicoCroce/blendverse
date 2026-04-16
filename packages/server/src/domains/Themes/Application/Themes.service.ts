import { executeUseCase } from '@server/Application';
import {
  Theme,
  ICreateTheme,
  IDeleteTheme,
  IGetAllThemes,
  IGetTheme,
  IUpdateTheme,
} from '../Domain';
import {
  CreateTheme,
  DeleteTheme,
  GetAllThemes,
  GetTheme,
  UpdateTheme,
} from './UseCases';

export class ThemesService {
  constructor(
    private readonly _createTheme: CreateTheme,
    private readonly _deleteTheme: DeleteTheme,
    private readonly _updateTheme: UpdateTheme,
    private readonly _getAllThemes: GetAllThemes,
    private readonly _getTheme: GetTheme,
  ) {}

  async createTheme({
    input,
    requestContext,
  }: ICreateTheme): Promise<Theme | null> {
    return executeUseCase({
      useCase: this._createTheme,
      input,
      requestContext,
    });
  }

  async deleteTheme({
    input,
    requestContext,
  }: IDeleteTheme): Promise<number | null> {
    return executeUseCase({
      useCase: this._deleteTheme,
      input,
      requestContext,
    });
  }

  async updateTheme({
    input,
    requestContext,
  }: IUpdateTheme): Promise<Theme | null> {
    return executeUseCase({
      useCase: this._updateTheme,
      input,
      requestContext,
    });
  }

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
