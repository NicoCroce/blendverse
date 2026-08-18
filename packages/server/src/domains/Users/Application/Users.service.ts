import { executeUseCase } from '@server/Application/Adapters/ExecuteUseCase';
import { ChangePassword, GetEmailsByUsersId, GetUser } from './';
import { IChangePassword, IGetEmailsByUsersId, IGetUser } from './users.types';
import { User } from '../Domain';

export class UsersService {
  constructor(
    private readonly _changePassword: ChangePassword,
    private readonly _getUser: GetUser,
    private readonly _getEmailsByUsersId: GetEmailsByUsersId,
  ) {}

  async getUser({ input, requestContext }: IGetUser): Promise<User> {
    return executeUseCase({
      useCase: this._getUser,
      input,
      requestContext,
    });
  }

  async changePassword({
    input,
    requestContext,
  }: IChangePassword): Promise<void> {
    return executeUseCase({
      useCase: this._changePassword,
      input,
      requestContext,
    });
  }

  async getEmailsByUsersId({
    input,
    requestContext,
  }: IGetEmailsByUsersId): Promise<string[]> {
    return executeUseCase({
      useCase: this._getEmailsByUsersId,
      input,
      requestContext,
    });
  }
}
