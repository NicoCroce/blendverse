import { UsersList, SearchUser, NewUserButton } from '../Components';
import { Page } from '@app/Aplication/Components/Layout/Page';

export const UsersListPage = () => {
  return (
    <Page title="Página de Usuarios">
      <div className="flex flex-col items-start gap-2">
        <div className="w-full flex justify-between gap-4">
          <SearchUser />
          <NewUserButton />
        </div>
        <UsersList />
      </div>
    </Page>
  );
};
