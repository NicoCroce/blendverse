import { Link } from 'react-router-dom';
import { UsersList, SearchUser } from '../Components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { Page } from '@app/Aplication/Components/Layout/Page';
import { Button } from '@app/Aplication/Components/ui/button';

import { USERS_NEW_ROUTE } from '../UsersRoutes';

export const UsersListPage = () => {
  return (
    <Page title="Página de Usuarios">
      <div className="flex flex-col items-start gap-2">
        <div className="w-full flex justify-between">
          <SearchUser />
          <Link to={USERS_NEW_ROUTE}>
            <Button>
              <FontAwesomeIcon icon={faUser} className="pr-4" />
              Agregar usuario
            </Button>
          </Link>
        </div>
        <UsersList />
      </div>
    </Page>
  );
};
