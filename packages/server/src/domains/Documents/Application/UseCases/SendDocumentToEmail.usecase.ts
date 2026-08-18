import { AppError, IUseCase } from '@server/Application';
import { Document } from '../../Domain/Document.entity';
import { DocumentRepository } from '../../Domain/Document.repository';
import { ISendDocumentToEmail } from '../documents.types';

export class SendDocumentToEmail implements IUseCase<Document> {
  constructor(private readonly documentsRepository: DocumentRepository) {}

  async execute({
    input,
    requestContext,
  }: ISendDocumentToEmail): Promise<Document> {
    const document = await this.documentsRepository.getDocument({
      id: input.documentId,
      requestContext,
    });

    if (!document) {
      throw new AppError('Documento no encontrado');
    }

    if (!document.canDownload) {
      throw new AppError(
        'El documento no está disponible para descarga. Debe estar firmado bajo conformidad.',
      );
    }

    return document;
  }
}
