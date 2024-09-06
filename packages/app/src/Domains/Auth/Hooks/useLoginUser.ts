import { toast } from 'sonner';
import { AuthService } from '../AuthService';
import { useNavigate } from 'react-router-dom';
import { MAIN_ROUTE } from '@app/Domains/Main/MainRoutes';

export const useLoginUser = () => {
  const navigate = useNavigate();

  return AuthService.login.useMutation({
    onError(error) {
      toast.error(error.message);
    },
    onSuccess: () => {
      navigate(MAIN_ROUTE);
    },
  });
};
