import { Button, Container } from '@app/Application/Components';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/Application/Components/ui/select';
import { AlertDialogCancelConfirm } from '@app/Application/Components/Molecules/AlertDialog';
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';
import { useDeleteCertificate } from '../../Hooks/useDeleteCertificate';
import { useUpdateCertificateStatus } from '../../Hooks/useUpdateCertificateStatus';
import { ICertificate } from '../../Certificate.entity';
import { CertificateStatus } from '@server/domains/Certificates/Domain/Certificate.types';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

type MutableStatus = Exclude<CertificateStatus, 'eliminado'>;

interface CertificateActionsProps {
  certificate: ICertificate;
  variant: 'owner' | 'admin';
}

const STATUS_OPTIONS: { value: MutableStatus; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'validando', label: 'Validando' },
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'rechazado', label: 'Rechazado' },
];

export const CertificateActions = ({
  certificate,
  variant,
}: CertificateActionsProps) => {
  const { mutateDelete, isPending: isDeleting } = useDeleteCertificate();
  const { mutateUpdate, isPending: isUpdating } = useUpdateCertificateStatus();

  const handleDelete = async () => {
    await mutateDelete(certificate.id);
  };

  const handleStatusChange = async (status: string) => {
    await mutateUpdate(certificate.id, status as MutableStatus);
  };

  // Los certificados eliminados no pueden tener acciones
  if (certificate.status === 'eliminado') return null;

  if (variant === 'owner') {
    if (certificate.status !== 'pendiente') return null;

    return (
      <AlertDialogCancelConfirm
        onConfirm={handleDelete}
        message="¿Estás seguro de que deseas eliminar esta licencia?"
      >
        <AlertDialogTrigger asChild>
          <Container row justify="end">
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              icon={faTrash}
              showIcon
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </Container>
        </AlertDialogTrigger>
      </AlertDialogCancelConfirm>
    );
  }

  // Admin variant
  return (
    <Container row className="gap-2">
      <Select value={certificate.status} onValueChange={handleStatusChange}>
        <SelectTrigger className="flex-1" disabled={isUpdating}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <AlertDialogCancelConfirm
        onConfirm={handleDelete}
        message="¿Estás seguro de que deseas eliminar esta licencia?"
      >
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={isDeleting}>
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </AlertDialogTrigger>
      </AlertDialogCancelConfirm>
    </Container>
  );
};
