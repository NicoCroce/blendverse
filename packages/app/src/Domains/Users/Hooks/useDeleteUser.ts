import { toast } from 'sonner';
import { UsersService } from '../UserService';
import { useCacheUsers } from './useCacheUsers';

export const useDeleteUser = () => {
  const cacheUsers = useCacheUsers();

  return UsersService.delete.useMutation({
    onMutate: () => toast.info('Eliminando usuario'),
    onError: () => toast.error('No se pudo eliminar el usuario'),
    onSuccess: () => {
      toast.success('Usuario eliminado');
      cacheUsers.invalidate();
    },
  });
};
