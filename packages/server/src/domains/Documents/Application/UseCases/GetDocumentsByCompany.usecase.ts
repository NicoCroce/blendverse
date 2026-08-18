import { AppError, IUseCase } from '@server/Application';
import {
  IGetDocumentsByCompany,
  IGetDocumentsByCompanyResponse,
} from '../documents.types';
import { DocumentRepository } from '../../Domain/Document.repository';
import { Document } from '../../Domain/Document.entity';

export class GetDocumentsByCompany implements IUseCase<IGetDocumentsByCompanyResponse> {
  constructor(private readonly documentsRepository: DocumentRepository) {}

  async execute({
    requestContext,
    input: filters,
  }: IGetDocumentsByCompany): Promise<IGetDocumentsByCompanyResponse> {
    const documents = await this.documentsRepository.getDocumentsByCompany({
      filters,
      requestContext,
    });

    if (!documents) {
      throw new AppError('Error al obtener los documentos');
    }

    // Use Map to preserve insertion order (already sorted by apellido from Sequelize)
    const documentsByUserMap = documents.reduce(
      (map: Map<number, { user: string; documents: Document[] }>, doc) => {
        const userId = doc.values.user?.id;
        if (!userId) return map;

        if (!map.has(userId)) {
          map.set(userId, {
            user: `${doc.values.user?.surname} ${doc.values.user?.name}`,
            documents: [],
          });
        }

        map.get(userId)!.documents.push(doc);
        return map;
      },
      new Map(),
    );

    // Return as array to preserve Sequelize sort order (numeric object keys lose order in JS)
    return Array.from(documentsByUserMap.entries()).map(([userId, value]) => ({
      userId,
      ...value,
    }));
  }
}
