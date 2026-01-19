import { User, UserRepository, IGetUsers } from '../../Domain';
import { IPaginationResponse, IUseCase } from '@server/Application';

export class GetUsers implements IUseCase<IPaginationResponse<User[]>> {
  constructor(private usersRepository: UserRepository) {}

  async execute({
    input,
    requestContext,
  }: IGetUsers): Promise<IPaginationResponse<User[]>> {
    return this.usersRepository.getUsers({
      filters: input,
      requestContext,
    });
  }
}
