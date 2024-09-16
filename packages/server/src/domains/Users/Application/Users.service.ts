import { executeUseCase } from '@server/Application/Adapters/ExecuteUseCase';
import { GetUsers, GetUser, RegisterUser, User } from '../Domain';
import { IGetUser, IGetUsers, IRegisterUser } from '../Domain/User.interfaces';

export class UsersService {
  constructor(
    private readonly _getUsers: GetUsers,
    private readonly _getUser: GetUser,
    private readonly _registerUser: RegisterUser,
  ) {}

  async getUsers({ requestContext }: IGetUsers): Promise<User[]> {
    return executeUseCase({ useCase: this._getUsers, requestContext });
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
}
