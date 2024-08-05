import { Title } from '@app/Aplication/Components/Typography/Title';
import { UsersList, SearchUser } from '../Components';
import { Card } from '@app/Aplication/Components/ui/card';
import { Button } from '@app/Aplication/Components';
import { Link } from 'react-router-dom';
import { USERS_NEW_ROUTE } from '../UsersRoutes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import AnimatedLayout from '@app/Aplication/Components/AnimatedLayout';

export const UsersListPage = () => {
  return (
    <AnimatedLayout>
      <div className="flex flex-col items-start gap-8">
        <Title>Página de Usuarios</Title>
        <Card className="p-4 w-full flex justify-between">
          <SearchUser />
          <Link to={USERS_NEW_ROUTE}>
            <Button>
              <FontAwesomeIcon icon={faUser} className="pr-4" />
              Agregar nuevo usuario
            </Button>
          </Link>
        </Card>
        <UsersList />
      </div>
    </AnimatedLayout>
  );
};
