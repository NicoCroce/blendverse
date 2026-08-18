import { toast } from 'sonner';
import { DisclaimerService } from '../Disclaimer.service';

export const useGetDisclaimerText = () => {
  return DisclaimerService.getText.useQuery;
};

export const useSignDisclaimer = () => {
  return DisclaimerService.sign.useMutation({
    onError: ({ message }: { message: string }) => toast.error(message),
    onSuccess: () => toast.success('Términos aceptados correctamente'),
  });
};

export const useGetStatus = () => {
  return DisclaimerService.getStatus.useQuery;
};
