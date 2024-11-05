import { executeUseCase } from '@server/Application/Adapters/ExecuteUseCase';
import {
  GetUsers,
  GetUser,
  RegisterUser,
  User,
  DeleteUser,
  UpdateUser,
  ChangePassword,
} from '../Domain';
import {
  IChangePassword,
  IDeleteUser,
  IGetUser,
  IGetUsers,
  IRegisterUser,
  IUpdateUser,
} from '../Domain/User.interfaces';

export class UsersService {
  constructor(
    private readonly _getUsers: GetUsers,
    private readonly _getUser: GetUser,
    private readonly _registerUser: RegisterUser,
    private readonly _deleteUser: DeleteUser,
    private readonly _updateUser: UpdateUser,
    private readonly _changePassword: ChangePassword,
  ) {}

  async getUsers({ input, requestContext }: IGetUsers): Promise<User[]> {
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
}
