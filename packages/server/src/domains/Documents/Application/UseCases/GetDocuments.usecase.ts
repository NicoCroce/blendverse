import { IUseCase } from '@server/Application';
import { Document } from '../../Domain/Document.entity';
import { DocumentRepository } from '../../Domain/Document.repository';
import { IGetDocuments } from '../documents.types';

export class GetDocuments implements IUseCase<Document[]> {
  constructor(private readonly documentsRepository: DocumentRepository) {}

  execute({ input, requestContext }: IGetDocuments): Promise<Document[]> {
    return this.documentsRepository.getDocuments({
      filters: input,
      requestContext,
    });
  }
}
