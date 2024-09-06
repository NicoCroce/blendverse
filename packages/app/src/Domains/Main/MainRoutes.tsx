import { Route } from 'react-router-dom';
import { MainPage } from './Pages/Main.page';

export const MAIN_ROUTE = '/main';

export const MainRouter = [
  <Route key="main" path={MAIN_ROUTE} element={<MainPage />} />,
];
