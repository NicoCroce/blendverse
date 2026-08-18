import { IUseCase } from '@server/Application';
import { DocumentRepository } from '../../Domain/Document.repository';
import {
  IGetStatisticsDocuments,
  IGetStatisticsDocumentsResponse,
} from '../documents.types';

export class GetStatisticsDocuments implements IUseCase<IGetStatisticsDocumentsResponse> {
  constructor(private readonly documentsRepository: DocumentRepository) {}

  execute({
    requestContext,
  }: IGetStatisticsDocuments): Promise<IGetStatisticsDocumentsResponse> {
    return this.documentsRepository.getStatisticsDocuments({
      requestContext,
    });
  }
}
