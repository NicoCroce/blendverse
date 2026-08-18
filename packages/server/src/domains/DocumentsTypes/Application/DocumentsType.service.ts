import { executeUseCase } from '@server/Application';
import { DocumentType } from '../Domain/DocumentType.entity';
import { GetDocumentsTypes } from './UseCases';
import { IGetDocumentsTypes } from './documentstypes.types';

export class DocumentTypesService {
  constructor(private readonly _getDocumentsTypes: GetDocumentsTypes) {}

  getDocumentsType({
    requestContext,
  }: IGetDocumentsTypes): Promise<DocumentType[]> {
    return executeUseCase({
      useCase: this._getDocumentsTypes,
      requestContext,
    });
  }
}
