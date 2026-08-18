import { toast } from 'sonner';
import { DocumentsService } from '../Documents.service';

export const useSendDocumentToEmail = () => {
  return DocumentsService.sendToEmail.useMutation({
    onSuccess: () => {
      toast.success('Documento enviado a tu email');
    },
    onError: () => {
      toast.error(
        'Error al enviar el documento. Verifica que esté firmado bajo conformidad.',
      );
    },
  });
};
