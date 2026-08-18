import { IUseCase } from '@server/Application';
import { DocumentType } from '../../Domain/DocumentType.entity';
import { DocumentsTypeRepository } from '../../Domain/DocumentType.repository';
import { IGetDocumentsTypes } from '../documentstypes.types';

export class GetDocumentsTypes implements IUseCase<DocumentType[]> {
  constructor(
    private readonly documentsTypesRepository: DocumentsTypeRepository,
  ) {}

  execute({ requestContext }: IGetDocumentsTypes): Promise<DocumentType[]> {
    return this.documentsTypesRepository.getDocumentsTypes({
      requestContext,
    });
  }
}
