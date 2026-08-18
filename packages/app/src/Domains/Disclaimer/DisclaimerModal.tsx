import { EmptyScreenError, Modal } from '@app/Application/Components';
import { DisclaimerForm } from './DisclaimerForm';
import { useGlobalStore } from '@app/Application';
import { useGetDisclaimerText } from './Hooks/useDisclaimer';
import { TUserLogged } from '@app/Domains/Users/User.entity';
import { Skeleton } from '@app/Application/Components/ui/skeleton';

export const DisclaimerModal = () => {
  const { data: dataUser, setQueryData } =
    useGlobalStore<TUserLogged>('dataUser');

  const {
    data: disclaimerText,
    isLoading,
    isError,
    error,
  } = useGetDisclaimerText()(undefined, {
    enabled: !!dataUser,
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
        {isError ? (
          <EmptyScreenError message={error?.message} />
        ) : isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : disclaimerText ? (
          <div className="max-h-60 overflow-y-auto rounded-md border p-4 text-sm text-muted-foreground">
            {disclaimerText.content}
          </div>
        ) : (
          <EmptyScreenError message="No se pudieron cargar los términos de esta empresa." />
        )}
        {disclaimerText && !isError && (
          <DisclaimerForm
            termsVersion={disclaimerText.version}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </Modal>
  );
};
