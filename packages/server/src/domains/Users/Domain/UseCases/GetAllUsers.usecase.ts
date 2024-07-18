import { IUseCase } from '@server/Application/Interfaces/IUSeCase';
import { User } from '../User.entity';
import { UserRepository } from '../User.repository';

export class GetAllUsers implements IUseCase<User[]> {
  constructor(private userRepository: UserRepository) {}

  async execute() {
    return await this.userRepository.getUsers();
  }
}
