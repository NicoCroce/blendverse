import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CertificatesService } from '../Certificates.service';
import { TRPCClientErrorLike } from '@trpc/client';
import { TCertificatesRouter } from '@server/domains/Certificates';

type CertificatesRouterError = TRPCClientErrorLike<TCertificatesRouter>;

/** Estados que un admin puede asignar manualmente (excluye 'eliminado', que solo se aplica vía delete). */
type MutableStatus = 'aprobado' | 'rechazado' | 'pendiente' | 'validando';

export const useUpdateCertificateStatus = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending } =
    CertificatesService.updateCertificateStatus.useMutation({
      onError: (err: CertificatesRouterError) => toast.error(err.message),
    });

  const mutateUpdate = (id: number, status: MutableStatus): Promise<void> => {
    return new Promise((resolve, reject) => {
      mutate(
        { id, status },
        {
          onSuccess: () => {
            toast.success('Estado actualizado');
            // Invalidar todas las queries de certificates (estructura anidada de tRPC v11)
            queryClient.invalidateQueries({
              predicate: (query) => {
                const queryKey = query.queryKey[0];
                return (
                  Array.isArray(queryKey) &&
                  queryKey.length > 0 &&
                  queryKey[0] === 'certificates'
                );
              },
            });
            resolve();
          },
          onError: (error: CertificatesRouterError) => reject(error),
        },
      );
    });
  };

  return { mutateUpdate, isPending };
};
