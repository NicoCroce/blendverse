import { toast } from 'sonner';
import { DocumentsService } from '../Documents.service';
import { useCacheDocuments } from './useCacheDocuments';
import { useURLParams } from '@app/Application';
import { DOCUMENTS_ROUTE } from '../Documents.routes';
import { TDocumentSearch } from '../Document.entity';

export const useSignDocument = () => {
  const cacheDocuments = useCacheDocuments();
  const { updateParams } = useURLParams<TDocumentSearch>(DOCUMENTS_ROUTE);
  return DocumentsService.sign.useMutation({
    onSuccess: () => {
      cacheDocuments.invalidate();
      toast.success('Documento firmado');
      updateParams({ id: undefined });
    },
    onError: () =>
      toast.error('La contraseña ingresada no corresponde con la de su cuenta'),
  });
};
