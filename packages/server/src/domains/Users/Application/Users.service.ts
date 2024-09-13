import { executeUseCase } from '@server/Application/Adapters/ExecuteUseCase';
import { GetAllUsers, GetUser, RegisterUser, User } from '../Domain';
import { RequestContext } from '@server/Application';

interface IregisterUser {
  mail: string;
  name: string;
  password: string;
  rePassword: string;
}

export class UsersService {
  constructor(
    private readonly _getAllUsers: GetAllUsers,
    private readonly _getUser: GetUser,
    private readonly _registerUser: RegisterUser,
  ) {}

  async getAllUsers(requestContext: RequestContext): Promise<User[]> {
    return await executeUseCase(this._getAllUsers, requestContext);
  }

  async registerUser(
    input: IregisterUser,
    requestContext: RequestContext,
  ): Promise<User> {
    return await executeUseCase(this._registerUser, input, requestContext, {
      mail: input.mail,
      name: input.name,
    });
  }

  async getUser(id: string, requestContext: RequestContext): Promise<User> {
    return await executeUseCase(this._getUser, id, requestContext);
  }
}
