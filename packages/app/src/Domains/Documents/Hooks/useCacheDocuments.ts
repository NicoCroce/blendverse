import { _documentsService } from '../Documents.service';

export const useCacheDocuments = () =>
  _documentsService.useUtils().documents.getAll;
