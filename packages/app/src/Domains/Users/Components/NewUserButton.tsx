import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@app/Aplication/Components/ui/button';

import { USERS_NEW_ROUTE } from '../Users.routes';

export const NewUserButton = () => (
  <Link to={USERS_NEW_ROUTE}>
    <Button>
      <FontAwesomeIcon icon={faUser} className="pr-4" />
      Agregar usuario
    </Button>
  </Link>
);
