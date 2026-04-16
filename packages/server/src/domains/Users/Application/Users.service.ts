import { executeUseCase } from '@server/Application/Adapters/ExecuteUseCase';
import {
  GetUsers,
  GetUser,
  RegisterUser,
  DeleteUser,
  UpdateUser,
  ChangePassword,
  GetSelectUser,
  GetEmailsByUsersId,
} from './';
import {
  IChangePassword,
  IDeleteUser,
  IGetEmailsByUsersId,
  IGetUser,
  IGetUsers,
  IRegisterUser,
  IUpdateUser,
  IGetSelectUser,
} from '../Domain/User.interfaces';
import { IPaginationResponse, ISelect } from '@server/Application';
import { User } from '../Domain';

export class UsersService {
  constructor(
    private readonly _getUsers: GetUsers,
    private readonly _getUser: GetUser,
    private readonly _registerUser: RegisterUser,
    private readonly _deleteUser: DeleteUser,
    private readonly _updateUser: UpdateUser,
    private readonly _changePassword: ChangePassword,
    private readonly _getSelectUser: GetSelectUser,
    private readonly _getEmailsByUsersId: GetEmailsByUsersId,
  ) {}

  async getUsers({
    input,
    requestContext,
  }: IGetUsers): Promise<IPaginationResponse<User[]>> {
    return executeUseCase({ useCase: this._getUsers, input, requestContext });
  }

  async registerUser({ input, requestContext }: IRegisterUser): Promise<User> {
    return executeUseCase({
      useCase: this._registerUser,
      input,
      requestContext,
      inputLog: {
        mail: input.mail,
        name: input.name,
      },
    });
  }

  async getUser({ input, requestContext }: IGetUser): Promise<User> {
    return executeUseCase({
      useCase: this._getUser,
      input,
      requestContext,
    });
  }

  async deleteUser({ input, requestContext }: IDeleteUser): Promise<number> {
    return executeUseCase({
      useCase: this._deleteUser,
      input,
      requestContext,
    });
  }

  async updateUser({ input, requestContext }: IUpdateUser): Promise<number> {
    return executeUseCase({
      useCase: this._updateUser,
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
  async getSelectUser({
    input,
    requestContext,
  }: IGetSelectUser): Promise<ISelect[]> {
    const data = await executeUseCase({
      useCase: this._getSelectUser,
      input,
      requestContext,
    });

    return data;
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
