import { IRequestContext } from '@server/Application';
import { DocumentType } from './DocumentType.entity';

export type IGetDocumentsTypesRepository = IRequestContext;

export interface DocumentsTypeRepository {
  getDocumentsTypes(
    params: IGetDocumentsTypesRepository,
  ): Promise<DocumentType[]>;
}
