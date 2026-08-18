import { container } from '@server/Infrastructure/di/Container';
import { GetDocumentsTypes } from './Application';
import { asClass } from 'awilix';
import { DocumentTypesService } from './Application';
import { DocumentsTypesController } from './Infrastructure/Controllers';
import { DocumentsTypesRespositoryImplementation } from './Infrastructure/Database';

export const documentTypesApp = {
  documentsTypesRepository: asClass(DocumentsTypesRespositoryImplementation),
  documentsTypesService: asClass(DocumentTypesService),
  documentsTypesController: asClass(DocumentsTypesController),
  _getDocumentsTypes: asClass(GetDocumentsTypes),
};

export const documentsTypesController = () =>
  container.resolve<DocumentsTypesController>('documentsTypesController');
