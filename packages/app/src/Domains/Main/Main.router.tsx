import { Route } from 'react-router-dom';
import { MainPage } from './Pages/Main.page';
import { MAIN_ROUTE } from './Main.routes';

export const MainRouter = [
  <Route key="main" path={MAIN_ROUTE} element={<MainPage />} />,
];
