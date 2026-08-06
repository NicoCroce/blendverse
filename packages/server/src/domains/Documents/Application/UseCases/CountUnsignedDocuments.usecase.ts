import { IRequestContext, IUseCase } from '@server/Application';
import { DocumentRepository } from '../../Domain';

/**
 * Conteo de documentos sin firmar (sección 7 del reporte diario).
 * Consumido por el dominio DailyReport vía inyección de dependencia.
 */
export class CountUnsignedDocuments implements IUseCase<number> {
  constructor(private readonly documentRepository: DocumentRepository) {}

  async execute({ requestContext }: IRequestContext): Promise<number> {
    return this.documentRepository.countUnsignedDocuments({ requestContext });
  }
}
