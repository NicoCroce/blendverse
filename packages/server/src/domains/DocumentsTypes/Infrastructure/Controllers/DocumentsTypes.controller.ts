import { protectedProcedure } from '@server/Infrastructure';
import { DocumentTypesService } from '../../Application';
import { executeServiceAlone } from '@server/Application';

export class DocumentsTypesController {
  constructor(private readonly documentsTypesService: DocumentTypesService) {}

  getDocumentsTypes = protectedProcedure.query(
    executeServiceAlone(
      this.documentsTypesService.getDocumentsType.bind(
        this.documentsTypesService,
      ),
    ),
  );
}
