import { IRequestContext, IUseCase } from '@server/Application';
import { UserRepository } from '../../Domain';

/**
 * Cuenta los empleados activos de una empresa para el reporte diario.
 * Consumido por el dominio DailyReport vía inyección de dependencia.
 */
export class CountActiveEmployees implements IUseCase<number> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ requestContext }: IRequestContext): Promise<number> {
    return this.userRepository.countActiveEmployees({ requestContext });
  }
}
