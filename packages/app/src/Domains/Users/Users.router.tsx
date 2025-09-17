import { Route } from 'react-router-dom';
import {
  ChangePasswordPage,
  UsersListPage,
  UsersListPageInfinit,
  UsersNewPage,
  UserUpdatePage,
} from './Pages';
import { UsersDetailSearch } from './Components';
import {
  USERS_ROUTE,
  USERS_SEARCH_DETAIL_ROUTE,
  USERS_NEW_ROUTE,
  USERS_UPDATE,
  USERS_CHANGE_PASSWORD,
  USERS_ROUTE_INFINIT,
} from './Users.routes';

export const UsersRouter = [
  <Route
    key="users-i"
    path={USERS_ROUTE_INFINIT}
    element={<UsersListPageInfinit />}
  />,
  <Route key="users" path={USERS_ROUTE} element={<UsersListPage />}>
    <Route
      key="users-detail"
      path={USERS_SEARCH_DETAIL_ROUTE}
      element={<UsersDetailSearch />}
    />
  </Route>,
  <Route key="users-new" path={USERS_NEW_ROUTE} element={<UsersNewPage />} />,
  <Route key="user-update" path={USERS_UPDATE} element={<UserUpdatePage />} />,
  <Route
    key="change-password"
    path={USERS_CHANGE_PASSWORD}
    element={<ChangePasswordPage />}
  />,
];
