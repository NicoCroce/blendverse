import { Route } from 'react-router-dom';
import { LoginPage } from './Pages';
import { AUTH_ROUTE } from './Auth.routes';

export const AuthRouter = [
  <Route key="auth" path={AUTH_ROUTE} element={<LoginPage />} />,
];
