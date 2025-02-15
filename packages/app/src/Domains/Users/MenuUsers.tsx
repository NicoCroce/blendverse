import { MenuItem } from '@app/Aplication';
import { USERS_ROUTE } from './Users.routes';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

export const MenuUsers = () => (
  <MenuItem to={USERS_ROUTE} icon={faUsers} text="Usuarios" />
);
