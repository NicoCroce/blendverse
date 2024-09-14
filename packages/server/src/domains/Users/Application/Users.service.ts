import { executeUseCase } from '@server/Application/Adapters/ExecuteUseCase';
import { GetUsers, GetUser, RegisterUser, User } from '../Domain';
import { RequestContext } from '@server/Application';

interface IregisterUser {
  mail: string;
  name: string;
  password: string;
  rePassword: string;
}

export class UsersService {
  constructor(
    private readonly _getUsers: GetUsers,
    private readonly _getUser: GetUser,
    private readonly _registerUser: RegisterUser,
  ) {}

  async getAllUsers(requestContext: RequestContext): Promise<User[]> {
    return await executeUseCase({ useCase: this._getUsers, requestContext });
  }

  async registerUser(
    input: IregisterUser,
    requestContext: RequestContext,
  ): Promise<User> {
    return await executeUseCase({
      useCase: this._registerUser,
      input,
      requestContext,
      inputLog: {
        mail: input.mail,
        name: input.name,
      },
    });
  }

  async getUser(input: string, requestContext: RequestContext): Promise<User> {
    return await executeUseCase({
      useCase: this._getUser,
      input,
      requestContext,
    });
  }
}
