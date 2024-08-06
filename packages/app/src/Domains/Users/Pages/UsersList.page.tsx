import { UsersList, SearchUser } from '../Components';
import { Button } from '@app/Aplication/Components';
import { Link } from 'react-router-dom';
import { USERS_NEW_ROUTE } from '../UsersRoutes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import AnimatedLayout from '@app/Aplication/Components/AnimatedLayout';
import { Page } from '@app/Aplication/Components/Page/Page';

export const UsersListPage = () => {
  return (
    <Page title="Página de Usuarios">
      <AnimatedLayout>
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
      </AnimatedLayout>
    </Page>
  );
};
