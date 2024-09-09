import { Route } from 'react-router-dom';
import { LoginPage } from './Pages';

export const AUTH_ROUTE = '/';

export const AuthRoutes = [
  <Route key="auth" path={AUTH_ROUTE} element={<LoginPage />} />,
];
