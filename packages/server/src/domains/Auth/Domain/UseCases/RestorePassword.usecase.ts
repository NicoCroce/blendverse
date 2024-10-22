import { AppError, IUseCase } from '@server/Application';
import { IRestorePassword } from '../auth.interfaces';
import { AuthRepository } from '../Auth.repository';

export class RestorePassword implements IUseCase<void> {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute({
    input: mail,
    requestContext,
  }: IRestorePassword): Promise<void> {
    try {
      await this.authRepository.restorePassword({ mail, requestContext });
    } catch {
      throw new AppError('No se pudo reestablecer la constraseña');
    }
  }
}
