import { IUseCase } from '@server/Application';
import { Document } from '../../Domain/Document.entity';
import { DocumentRepository } from '../../Domain/Document.repository';
import { IGetDocument } from '../documents.types';

export class GetDocument implements IUseCase<Document | null> {
  constructor(private readonly documentsRepository: DocumentRepository) {}

  execute({ input, requestContext }: IGetDocument): Promise<Document | null> {
    return this.documentsRepository.getDocument({
      id: input,
      requestContext,
    });
  }
}
