import { toast } from 'sonner';
import { AuthService } from '../Auth.service';
import { useNavigate } from 'react-router-dom';
import { AUTH_ROUTE } from '../Auth.routes';

export const useRestorePassword = () => {
  const navigate = useNavigate();

  return AuthService.restorePassword.useMutation({
    onError(error) {
      toast.error(error.message);
    },
    onSuccess(_, mail) {
      toast.success(`Continúa con el mail que recibiste en ${mail}`);
      navigate(AUTH_ROUTE);
    },
  });
};
