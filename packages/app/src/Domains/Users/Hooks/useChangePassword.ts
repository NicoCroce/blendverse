import { toast } from 'sonner';
import { UsersService } from '../Users.service';
import { useCacheUsers } from './useCacheUsers';

export const useChangePassword = () => {
  const cacheUsers = useCacheUsers();

  return UsersService.changePassword.useMutation({
    onError: ({ message }) => toast.error(message),
    onSuccess: () => {
      toast.success('Contraseña actualizada');
      cacheUsers.invalidate();
    },
  });
};
