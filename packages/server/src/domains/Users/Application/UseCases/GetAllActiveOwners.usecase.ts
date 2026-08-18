import { IRequestContext, IUseCase } from '@server/Application';
import { ICompanyOwner, UserRepository } from '../../Domain';

/**
 * Expone las empresas (owners) del sistema para el reporte diario.
 * Consumido por el dominio DailyReport vía inyección de dependencia.
 */
export class GetAllActiveOwners implements IUseCase<ICompanyOwner[]> {
  constructor(private readonly usersRepository: UserRepository) {}

  async execute({ requestContext }: IRequestContext): Promise<ICompanyOwner[]> {
    return this.usersRepository.getAllActiveOwners({ requestContext });
  }
}
