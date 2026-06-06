import { toast } from 'sonner';
import { AuthService } from '../Auth.service';
import { useNavigate } from 'react-router-dom';
import { setLogged } from '@app/Application/Helpers/isLogged';
import { MAIN_ROUTE } from '@app/Domains/Main';
import { useGlobalStore } from '@app/Application';
import { TUserLogged } from '@app/Domains/Users';

export const useLoginUser = () => {
  const navigate = useNavigate();
  const { setQueryData } = useGlobalStore<TUserLogged>('dataUser');

  return AuthService.login.useMutation({
    onError(error) {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      setLogged();
      setQueryData(data);
      navigate(MAIN_ROUTE);
    },
  });
};
