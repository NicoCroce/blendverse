import { AppError, executeUseCase, IUseCase } from '@server/Application';
import { User } from '../User.entity';
import { UserRepository } from '../User.repository';
import { IUpdateUser } from '../User.interfaces';
import { AssociateUserToRole } from '@server/domains/Permissions';

export class UpdateUser implements IUseCase<number> {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly _associateUserToRole: AssociateUserToRole,
  ) {}

  async execute({
    input: { id, mail, name, role },
    requestContext,
  }: IUpdateUser): Promise<number> {
    const user = User.create({ id, mail, name });
    const response = await this.usersRepository.updateUser({
      user,
      requestContext,
    });

    if (!response) {
      throw new AppError('The user can`t be updated');
    }

    try {
      await executeUseCase({
        requestContext,
        useCase: this._associateUserToRole,
        input: {
          role,
          userId: id,
        },
      });
    } catch {
      throw new AppError('Can`t assign the rol');
    }

    return response;
  }
}
