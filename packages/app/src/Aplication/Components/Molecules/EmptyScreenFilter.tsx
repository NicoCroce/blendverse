import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, AlertTitle } from '../ui/alert';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Button } from './Button';

interface EmptyScreenFilterProps {
  onClick?: () => void;
}

export const EmptyScreenFilter = ({ onClick }: EmptyScreenFilterProps) => (
  <Alert>
    <FontAwesomeIcon icon={faCircleExclamation} size="lg" />
    <AlertTitle>No se encontraron coincidencias</AlertTitle>
    <Button variant="link" onClick={onClick}>
      Prueba cambiando los filtros
    </Button>
  </Alert>
);
