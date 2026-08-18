import { AlertMessage } from '..';

interface EmptyScreenErrorProps {
  message?: string;
}

export const EmptyScreenError = ({
  message = 'Ocurrió un error al cargar los datos',
}: EmptyScreenErrorProps) => (
  <AlertMessage variant="error" title="Error" description={message} />
);
