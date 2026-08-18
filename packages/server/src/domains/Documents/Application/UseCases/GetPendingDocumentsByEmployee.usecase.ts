import { IUseCase } from '@server/Application';
import { DocumentRepository, IPendingDocumentForEmployee } from '../../Domain';
import { IGetPendingDocumentsByEmployee } from '../documents.types';

/**
 * Expone los documentos pendientes de UN empleado (sin firmar y/o sin
 * visualizar) con sus flags. Consumido por el dominio EmployeeReminders vía
 * inyección de dependencia (cross-domain). Multi-tenant: el repositorio filtra
 * por `Usuario_id = employeeId` y por el owner del empleado (Pr. II).
 */
export class GetPendingDocumentsByEmployee implements IUseCase<
  IPendingDocumentForEmployee[]
> {
  constructor(private readonly documentsRepository: DocumentRepository) {}

  async execute({
    input,
    requestContext,
  }: IGetPendingDocumentsByEmployee): Promise<IPendingDocumentForEmployee[]> {
    return this.documentsRepository.getPendingDocumentsByEmployee({
      employeeId: input.employeeId,
      requestContext,
    });
  }
}
