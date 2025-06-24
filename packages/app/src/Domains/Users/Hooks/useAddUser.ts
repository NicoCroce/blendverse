import { toast } from 'sonner';
import { UsersService } from '../Users.service';
import { useCacheUsers } from './useCacheUsers';

export const useAddUser = () => {
  //**  Accedo a los datos almacenados en tRPC. */
  const cacheUserList = useCacheUsers();

  return UsersService.create.useMutation({
    onError: (_err, _variables) => {
      toast.error('Usuario no agregado');
    },
    onSuccess: () => {
      toast.success('Usuario agregado');
      cacheUserList.invalidate();
    },
  });
};
