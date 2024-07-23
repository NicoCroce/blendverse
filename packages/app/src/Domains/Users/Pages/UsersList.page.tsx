import { UsersList, NewUser, SearchUser } from '../Components';

export const UsersListPage = () => {
  return (
    <div>
      <h1>Página de Users</h1>
      <NewUser />
      <SearchUser />
      <UsersList />
    </div>
  );
};
