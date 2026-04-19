import { Button, Container } from '@app/Aplication';

interface ConfigActionsProps {
  onConfirm: () => void;
  onCancel: () => void;
  disabled: boolean;
  isPending: boolean;
}

export const ConfigActions = ({
  onConfirm,
  onCancel,
  disabled,
  isPending,
}: ConfigActionsProps) => {
  return (
    <Container row justify="end" className="pt-2 mt-20">
      <Button onClick={onConfirm} disabled={disabled || isPending}>
        Guardar cambios
      </Button>
      <Button onClick={onCancel} variant="destructive">
        Descartar
      </Button>
    </Container>
  );
};
