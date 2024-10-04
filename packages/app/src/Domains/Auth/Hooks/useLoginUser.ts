import { toast } from 'sonner';
import { AuthService } from '../Auth.service';
import { useNavigate } from 'react-router-dom';
import { setLogged } from '@app/Aplication/Helpers/isLogged';
import { MAIN_ROUTE } from '@app/Domains/Main';
import { setLoggedUser } from '@app/Aplication/Helpers/manageLoggedUser';
import { useGlobalStore } from '@app/Aplication';

export const useLoginUser = () => {
  const navigate = useNavigate();
  const { setQueryData } = useGlobalStore('dataUser');

  return AuthService.login.useMutation({
    onError(error) {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      setLogged();
      setLoggedUser(data);
      setQueryData(data);
      navigate(MAIN_ROUTE);
    },
  });
};
