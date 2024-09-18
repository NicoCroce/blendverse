import { toast } from 'sonner';
import { UsersService } from '../Users.service';
import { useCacheUsers } from './useCacheUsers';

export const useUpdateUser = () => {
  const cacheUsers = useCacheUsers();

  return UsersService.update.useMutation({
    onMutate: () => toast.info('Actualizando usuario'),
    onError: () => toast.error('No se pudo actualizar el usuario'),
    onSuccess: () => {
      toast.success('Usuario actualizado');
      cacheUsers.invalidate();
    },
  });
};
