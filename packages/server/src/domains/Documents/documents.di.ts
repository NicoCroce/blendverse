import { asClass } from 'awilix';
import { DocumentsService } from './Application/Documents.service';
import { DocumentsController } from './Infrastructure/Controllers/Documents.controller';
import { container } from '@server/Infrastructure/di/Container';
import {
  CountUnsignedDocuments,
  GetDocument,
  GetDocuments,
  GetDocumentsByCompany,
  GetStatisticsDocuments,
  GetUnsignedDocuments,
  SendDocumentToEmail,
  SignDocument,
  ViewDocument,
} from './Application';
import { DocumentsRepositoryImplementation } from './Infrastructure';

export const documentsApp = {
  documentsRepository: asClass(DocumentsRepositoryImplementation),
  documentsService: asClass(DocumentsService),
  documentsController: asClass(DocumentsController),
  _getDocuments: asClass(GetDocuments),
  _getDocument: asClass(GetDocument),
  _signDocument: asClass(SignDocument),
  _viewDocument: asClass(ViewDocument),
  _getDocumentsByCompany: asClass(GetDocumentsByCompany),
  _getStatisticsDocuments: asClass(GetStatisticsDocuments),
  _sendDocumentToEmail: asClass(SendDocumentToEmail),
  // Reporte diario (daily-admin-report)
  _getUnsignedDocuments: asClass(GetUnsignedDocuments),
  _countUnsignedDocuments: asClass(CountUnsignedDocuments),
};

export const documentsController = () =>
  container.resolve<DocumentsController>('documentsController');
