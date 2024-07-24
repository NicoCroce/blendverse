import { Title } from '@app/Aplication/Components/Typography/Title';
import { UsersList, NewUser, SearchUser } from '../Components';

export const UsersListPage = () => {
  return (
    <div className="flex flex-col items-start gap-8">
      <Title>Página de Usuarios</Title>
      <NewUser />
      <SearchUser />
      <UsersList />
    </div>
  );
};
