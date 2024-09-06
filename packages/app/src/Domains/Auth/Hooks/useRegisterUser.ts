import { toast } from 'sonner';
import { AuthService } from '../AuthService';

export const useRegisterUser = () => {
  return AuthService.register.useMutation({
    onError(error) {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success('Ususario creado. Inicie sesión');
    },
  });
};
