import { DocumentsTypesService } from '../Documents.service';

export const useGetDocumentsTypes = () => {
  return DocumentsTypesService.getAll.useQuery();
};
