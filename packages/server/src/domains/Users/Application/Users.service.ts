import { executeUseCase } from '@server/Application/Adapters/ExecuteUseCase';
import {
  GetUsers,
  GetUser,
  RegisterUser,
  User,
  DeleteUser,
  UpdateUser,
} from '../Domain';
import {
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

  async deleteUser({ input, requestContext }: IDeleteUser): Promise<string> {
    return executeUseCase({
      useCase: this._deleteUser,
      input,
      requestContext,
    });
  }

  async updateUser({ input, requestContext }: IUpdateUser): Promise<string> {
    return executeUseCase({
      useCase: this._updateUser,
      input,
      requestContext,
    });
  }
}
