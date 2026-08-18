import { toast } from 'sonner';
import { AuthService } from '../Auth.service';
import { useNavigate } from 'react-router-dom';
import { setLogged } from '@app/Application/Helpers/isLogged';
import { useGlobalStore } from '@app/Application';
import { DASHBOARD_ACCESS } from '@app/Application/Helpers/permissions';
import { DOCUMENTS_ROUTE } from '@app/Domains/Documents';
import { TUserLogged } from '@app/Domains/Users';
import { SELECCIONAR_EMPRESA_ROUTE } from '@app/Domains/EmpresasUsuarios';
import { DOCUMENTS_DASHBOARD } from '@app/Domains/Admin';
import { TrpcApi } from '@app/Infrastructure/Services/clientApi';

export const useLoginUser = () => {
  const navigate = useNavigate();
  const { setQueryData } = useGlobalStore<TUserLogged>('dataUser');
  const utils = TrpcApi.useUtils();

  return AuthService.login.useMutation({
    onError(error) {
      toast.error(error.message);
    },
    onSuccess: async (data) => {
      setLogged();
      setQueryData(data);
      try {
        const [empresas, permissions] = await Promise.all([
          utils.empresasUsuarios.getByUsuario.fetch({
            userId: data.id ?? 0,
          }),
          utils.permissions.getPermissionByUser.fetch(),
        ]);
        if ((empresas ?? []).length >= 2) {
          navigate(SELECCIONAR_EMPRESA_ROUTE);
        } else if ((permissions ?? []).includes(DASHBOARD_ACCESS)) {
          navigate(DOCUMENTS_DASHBOARD);
        } else {
          navigate(DOCUMENTS_ROUTE);
        }
      } catch {
        navigate(DOCUMENTS_ROUTE);
      }
    },
  });
};
