import { AlertMessage } from '../Organisms/AlertMessage';

interface EmptyScreenFilterProps {
  onClick?: () => void;
}

export const EmptyScreenFilter = ({ onClick }: EmptyScreenFilterProps) => (
  <AlertMessage
    variant="search"
    title="No se encontraron coincidencias"
    action={
      onClick
        ? { label: 'Actualizar filtros', onClick, variant: 'link' }
        : undefined
    }
  />
);
