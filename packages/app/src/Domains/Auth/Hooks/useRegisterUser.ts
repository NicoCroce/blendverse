import { toast } from 'sonner';
import { UsersService } from '@app/Domains/Users';

export const useRegisterUser = (onSuccess?: () => void) => {
  return UsersService.create.useMutation({
    onError(error) {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success('Ususario creado. Inicie sesión');
      onSuccess?.();
    },
  });
};
