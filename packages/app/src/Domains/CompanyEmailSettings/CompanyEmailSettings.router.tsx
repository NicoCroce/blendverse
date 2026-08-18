import { Route } from 'react-router-dom';
import { CompanyEmailSettingsPage } from './Pages';
import { COMPANY_EMAIL_SETTINGS_ROUTE } from './CompanyEmailSettings.routes';

export const CompanyEmailSettingsRouter = [
  <Route
    key="company-email-settings"
    path={COMPANY_EMAIL_SETTINGS_ROUTE}
    element={<CompanyEmailSettingsPage />}
  />,
];
