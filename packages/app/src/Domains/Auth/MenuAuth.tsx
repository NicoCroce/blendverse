import { MenuItem } from '@app/Aplication';
import { USERS_CHANGE_PASSWORD } from '../Users';
import {
  faArrowRightFromBracket,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

export const MenuAuth = () => {
  return (
    <>
      <MenuItem
        to={USERS_CHANGE_PASSWORD}
        icon={faUser}
        text="Mi Cueta"
        onlyMobile
      />
      <MenuItem to="/" icon={faArrowRightFromBracket} text="Salir" />
    </>
  );
};
