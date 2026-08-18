import { useRef } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useGlobalStore } from '@app/Application';
import { DASHBOARD_ACCESS } from '@app/Application/Helpers/permissions';
import { TUserLogged } from '@app/Domains/Users';
import { DOCUMENTS_ROUTE } from '@app/Domains/Documents';
import { DOCUMENTS_DASHBOARD } from '@app/Domains/Admin';
import { TrpcApi } from '@app/Infrastructure/Services/clientApi';
import { EmpresasUsuariosService } from '../EmpresasUsuarios.service';

type SelectEmpresaVars = {
  empresaId: number;
  companyName: string;
  companyLogo: string | null;
};

export const useSelectEmpresa = () => {
  const navigate = useNavigate();
  const { setQueryData } = useGlobalStore<TUserLogged>('dataUser');
  const utils = TrpcApi.useUtils();
  const companyDataRef = useRef<{
    companyName: string;
    companyLogo: string | null;
  } | null>(null);

  const mutation = EmpresasUsuariosService.selectEmpresa.useMutation({
    onSuccess: async (data) => {
      setQueryData((prev) => ({
        ...prev!,
        ownerId: data.ownerId,
        companyName: companyDataRef.current?.companyName ?? prev?.companyName,
        companyLogo: companyDataRef.current?.companyLogo ?? prev?.companyLogo,
      }));
      try {
        const permissions = await utils.permissions.getPermissionByUser.fetch();
        if ((permissions ?? []).includes(DASHBOARD_ACCESS)) {
          navigate(DOCUMENTS_DASHBOARD);
        } else {
          navigate(DOCUMENTS_ROUTE);
        }
      } catch {
        navigate(DOCUMENTS_ROUTE);
      }
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });

  return {
    ...mutation,
    mutate: ({ empresaId, companyName, companyLogo }: SelectEmpresaVars) => {
      companyDataRef.current = { companyName, companyLogo };
      mutation.mutate({ empresaId });
    },
  };
};
