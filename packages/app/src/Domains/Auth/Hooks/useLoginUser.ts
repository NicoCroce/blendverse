import { toast } from 'sonner';
import { AuthService } from '../Auth.service';
import { useNavigate } from 'react-router-dom';
import { setLogged } from '@app/Aplication/Helpers/isLogged';
import { MAIN_ROUTE } from '@app/Domains/Main';

export const useLoginUser = () => {
  const navigate = useNavigate();

  return AuthService.login.useMutation({
    onError(error) {
      toast.error(error.message);
    },
    onSuccess: () => {
      setLogged();
      navigate(MAIN_ROUTE);
    },
  });
};
