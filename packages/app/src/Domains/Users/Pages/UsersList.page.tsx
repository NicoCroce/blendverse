import { UsersList, SearchUser, NewUserButton } from '../Components';
import { Page } from '@app/Aplication/Components/Layout/Page';

export const UsersListPage = () => {
  return (
    <Page title="Página de Usuarios" headerRight={<NewUserButton />}>
      <div className="flex flex-col items-start gap-2">
        <SearchUser />
        <UsersList />
      </div>
    </Page>
  );
};
