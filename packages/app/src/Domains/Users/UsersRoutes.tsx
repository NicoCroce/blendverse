import { Route } from 'react-router-dom';
import { UsersListPage, UsersNewPage, UserUpdatePage } from './Pages';
import { UsersDetailSearch } from './Components';

export const USERS_ROUTE = '/users';
export const USERS_NEW_ROUTE = `${USERS_ROUTE}/new`;
export const USERS_SEARCH_DETAIL_ROUTE = `${USERS_ROUTE}/searchDetail/:id`;
export const USERS_UPDATE = `${USERS_ROUTE}/updateUser/:id`;

export const UsersRouter = [
  <Route key="users" path={USERS_ROUTE} element={<UsersListPage />}>
    <Route
      key="users-detail"
      path={USERS_SEARCH_DETAIL_ROUTE}
      element={<UsersDetailSearch />}
    />
  </Route>,
  <Route key="users-new" path={USERS_NEW_ROUTE} element={<UsersNewPage />} />,
  <Route key="user-update" path={USERS_UPDATE} element={<UserUpdatePage />} />,
];
