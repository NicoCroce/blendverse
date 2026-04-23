import { executeUseCase } from '@server/Application';
import {
  IUpdateTheme,
  IGetOwnerTheme,
  IGetOwnersys,
  Ownersys,
} from '../Domain';
import { ChangeTheme, GetOwnerTheme, GetOwnersys } from './UseCases';

export class OwnersyssService {
  constructor(
    private readonly _changeTheme: ChangeTheme,
    private readonly _getOwnerTheme: GetOwnerTheme,
    private readonly _getOwnersys: GetOwnersys,
  ) {}
  async getOwnersys({
    input,
    requestContext,
  }: IGetOwnersys): Promise<Ownersys | null> {
    return executeUseCase({
      useCase: this._getOwnersys,
      input,
      requestContext,
    });
  }
  async updateTheme({
    input,
    requestContext,
  }: IUpdateTheme): Promise<number | null> {
    return executeUseCase({
      useCase: this._changeTheme,
      input,
      requestContext,
    });
  }

  async getOwnerTheme({ requestContext }: IGetOwnerTheme) {
    return executeUseCase({
      useCase: this._getOwnerTheme,
      requestContext,
    });
  }
}
