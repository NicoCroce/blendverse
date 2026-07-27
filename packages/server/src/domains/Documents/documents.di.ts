import { asClass } from 'awilix';
import { DocumentsService } from './Application/Documents.service';
import { DocumentsController } from './Infrastructure/Controllers/Documents.controller';
import { container } from '@server/Infrastructure/di/Container';
import {
  GetDocument,
  GetDocuments,
  GetDocumentsByCompany,
  GetStatisticsDocuments,
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
};

export const documentsController = () =>
  container.resolve<DocumentsController>('documentsController');
