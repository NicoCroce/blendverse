import { IRequestContext, IUseCase } from '@server/Application';
import { DocumentRepository, IUnsignedDocumentRecord } from '../../Domain';

/**
 * Sección 3 del reporte diario: documentos sin firmar.
 * Consumido por el dominio DailyReport vía inyección de dependencia.
 */
export class GetUnsignedDocuments implements IUseCase<
  IUnsignedDocumentRecord[]
> {
  constructor(private readonly documentsRepository: DocumentRepository) {}

  async execute({
    requestContext,
  }: IRequestContext): Promise<IUnsignedDocumentRecord[]> {
    return this.documentsRepository.getUnsignedDocuments({ requestContext });
  }
}
