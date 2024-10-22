import { Route } from 'react-router-dom';
import { LoginPage } from './Pages';
import { AUTH_ROUTE, RESTORE_PASSWORD } from './Auth.routes';
import { RestorePasswordPage } from './Pages/RestorePasswordPage';

export const AuthRouter = [
  <Route key="auth" path={AUTH_ROUTE} element={<LoginPage />} />,
  <Route
    key="restore-password"
    path={RESTORE_PASSWORD}
    element={<RestorePasswordPage />}
  />,
];
