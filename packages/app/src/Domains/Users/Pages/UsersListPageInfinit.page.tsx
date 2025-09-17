import { UsersList, SearchUser, NewUserButton } from '../Components';
import { Page } from '@app/Aplication/Components/Layout/Page';

export const UsersListPageInfinit = () => {
  return (
    <Page
      title="Página de Usuarios Scroll Infinito"
      headerRight={<NewUserButton />}
    >
      <div className="flex flex-col items-start gap-2">
        <SearchUser />
        <UsersList />
      </div>
    </Page>
  );
};
