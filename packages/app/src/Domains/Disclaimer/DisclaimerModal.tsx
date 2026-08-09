import { Modal } from '@app/Application/Components';
import { DisclaimerForm } from './DisclaimerForm';
import { useGlobalStore } from '@app/Application';
import { useGetDisclaimerText } from './Hooks/useDisclaimer';
import { TUserLogged } from '@app/Domains/Users/User.entity';
import { Skeleton } from '@app/Application/Components/ui/skeleton';

export const DisclaimerModal = () => {
  const { data: dataUser, setQueryData } =
    useGlobalStore<TUserLogged>('dataUser');

  const ownerId = dataUser?.ownerId;

  const { data: disclaimerText, isLoading } = useGetDisclaimerText()(ownerId!, {
    enabled: !!ownerId,
  });

  if (!dataUser || !dataUser.pendingDisclaimer) {
    return null;
  }

  const handleSuccess = () => {
    setQueryData((prev) => ({
      ...prev!,
      pendingDisclaimer: false,
    }));
  };

  return (
    <Modal
      isOpen={true}
      title="Términos y condiciones"
      description="Debe aceptar los términos y condiciones antes de continuar"
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto rounded-md border p-4 text-sm text-muted-foreground">
            {disclaimerText || 'No hay términos definidos para esta empresa.'}
          </div>
        )}
        <DisclaimerForm onSuccess={handleSuccess} />
      </div>
    </Modal>
  );
};
