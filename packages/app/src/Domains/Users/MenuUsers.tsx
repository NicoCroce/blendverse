import { MenuItem, USER_ACCESS } from '@app/Aplication';
import { USERS_ROUTE } from './Users.routes';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

export const MenuUsers = () => (
  <MenuItem
    permission={USER_ACCESS}
    to={USERS_ROUTE}
    icon={faUsers}
    text="Usuarios"
  />
);
