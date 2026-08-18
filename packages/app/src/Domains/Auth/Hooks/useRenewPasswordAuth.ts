import { toast } from 'sonner';
import { AuthService } from '../Auth.service';
import { useNavigate } from 'react-router-dom';
import { AUTH_ROUTE } from '../Auth.routes';

export const useRenewPasswordAuth = () => {
  const navigate = useNavigate();

  return AuthService.renewPasswordAuth.useMutation({
    onError(error) {
      toast.error(error.message);
    },
    onSuccess() {
      toast.success(`Puedes ingresar con tu nueva contraseña`);
      navigate(AUTH_ROUTE);
    },
  });
};
