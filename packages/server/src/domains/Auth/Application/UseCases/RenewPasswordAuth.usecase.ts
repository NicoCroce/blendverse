import { executeUseCase, IUseCase } from '@server/Application';
import { RenewPassword } from '@server/domains/Users';
import { IRenewPasswordAuthUsecase } from '../../Domain/auth.interfaces';

export class RenewPasswordAuth implements IUseCase<void> {
  constructor(private readonly _renewPassword: RenewPassword) {}

  async execute({
    input,
    requestContext,
  }: IRenewPasswordAuthUsecase): Promise<void> {
    return executeUseCase({
      useCase: this._renewPassword,
      input,
      requestContext,
    });
  }
}
