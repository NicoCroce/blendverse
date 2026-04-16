import { Route } from 'react-router-dom';
import { CONFIG_ROUTE } from './Config.routes';
import { ConfigurationPage } from './Pages';

export const ConfigRouter = [
  <Route key="config" path={CONFIG_ROUTE} element={<ConfigurationPage />} />,
];
