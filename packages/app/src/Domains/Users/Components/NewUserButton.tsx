import { Link } from 'react-router-dom';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@app/Aplication/';

import { USERS_NEW_ROUTE } from '../Users.routes';

export const NewUserButton = () => (
  <Link to={USERS_NEW_ROUTE}>
    <Button icon={faUser} showIcon>
      Agregar usuario
    </Button>
  </Link>
);
