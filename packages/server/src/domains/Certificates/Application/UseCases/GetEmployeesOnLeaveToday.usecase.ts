import { IRequestContext, IUseCase } from '@server/Application';
import { CertificateRepository, IEmployeeOnLeaveRecord } from '../../Domain';

/**
 * Sección 1 del reporte diario: empleados con licencia aprobada en curso hoy.
 * Consumido por el dominio DailyReport vía inyección de dependencia.
 */
export class GetEmployeesOnLeaveToday implements IUseCase<
  IEmployeeOnLeaveRecord[]
> {
  constructor(private readonly certificatesRepository: CertificateRepository) {}

  async execute({
    requestContext,
  }: IRequestContext): Promise<IEmployeeOnLeaveRecord[]> {
    return this.certificatesRepository.getEmployeesOnLeaveToday({
      requestContext,
    });
  }
}
