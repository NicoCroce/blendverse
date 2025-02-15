import { DASHBOARD_ACCESS, MenuItem } from '@app/Aplication';
import { MAIN_ROUTE } from './Main.routes';
import { faDashboard } from '@fortawesome/free-solid-svg-icons';

export const MenuMain = () => (
  <MenuItem
    permission={DASHBOARD_ACCESS}
    to={MAIN_ROUTE}
    icon={faDashboard}
    text="Dashboard"
  />
);
