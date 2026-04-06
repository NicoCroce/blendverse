import { toast } from 'sonner';
import { UsersService } from '../Users.service';
import { useGlobalStore } from '@app/Aplication';
import { TUserLogged } from '../User.entity';

export const useChangePassword = () => {
  const { setQueryData } = useGlobalStore<TUserLogged>('dataUser');

  return UsersService.changePassword.useMutation({
    onError: ({ message }) => toast.error(message),
    onSuccess: () => {
      toast.success('Contraseña actualizada');
      setQueryData((prev) => ({ ...prev!, renewPassword: false }));
    },
  });
};
