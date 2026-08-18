import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CertificatesService } from '../Certificates.service';
import { TRPCClientErrorLike } from '@trpc/client';
import { TCertificatesRouter } from '@server/domains/Certificates';

type CertificatesRouterError = TRPCClientErrorLike<TCertificatesRouter>;

export const useDeleteCertificate = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending } =
    CertificatesService.deleteCertificate.useMutation({
      onError: (err: CertificatesRouterError) => toast.error(err.message),
    });

  const mutateDelete = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      mutate(
        { id },
        {
          onSuccess: () => {
            toast.success('Licencia eliminada');
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

  return { mutateDelete, isPending };
};
