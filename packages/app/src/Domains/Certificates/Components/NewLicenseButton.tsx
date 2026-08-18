import { cn } from '@app/Application/lib/utils';
import { buttonVariants } from '@app/Application/Components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { CERTIFICATES_ROUTES_ADD } from '../Certificates.routes';

export const NewLicenseButton = () => {
  return (
    <Link
      to={CERTIFICATES_ROUTES_ADD}
      className={cn(
        buttonVariants({ variant: 'default' }),
        'flex gap-2 p-[14px] h-control px-4 cursor-pointer',
      )}
    >
      <FontAwesomeIcon icon={faAdd} size="1x" />
      Cargar licencia
    </Link>
  );
};
