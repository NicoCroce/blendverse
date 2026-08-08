import { IUseCase } from '@server/Application';
import {
  DocumentRepository,
  IPendingDocumentForEmployeeWithEmployeeId,
} from '../../Domain';
import { IGetPendingDocumentsByEmployees } from '../documents.types';

/**
 * Expone los documentos pendientes (sin firmar y/o sin visualizar) de VARIOS
 * empleados en UNA sola consulta (mejora N+1 del batch diario). Cada registro
 * incluye su `employeeId` para agrupar en memoria. Multi-tenant: el
 * repositorio filtra por `Usuario_id IN (employeeIds)` y por el owner del
 * requestContext (Pr. II). Consumido por EmployeeReminders vía DI (cross-domain).
 */
export class GetPendingDocumentsByEmployees implements IUseCase<
  IPendingDocumentForEmployeeWithEmployeeId[]
> {
  constructor(private readonly documentsRepository: DocumentRepository) {}

  async execute({
    input,
    requestContext,
  }: IGetPendingDocumentsByEmployees): Promise<
    IPendingDocumentForEmployeeWithEmployeeId[]
  > {
    return this.documentsRepository.getPendingDocumentsByEmployees({
      employeeIds: input.employeeIds,
      requestContext,
    });
  }
}
