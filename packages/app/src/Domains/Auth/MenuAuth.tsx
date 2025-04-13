import { MenuItem, useDevice } from '@app/Aplication';
import { USERS_CHANGE_PASSWORD } from '../Users';
import {
  faArrowRightFromBracket,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

export const MenuAuth = () => {
  const { isMobile } = useDevice();
  return (
    <>
      {isMobile && (
        <MenuItem to={USERS_CHANGE_PASSWORD} icon={faUser} text="Mi Cuenta" />
      )}
      <MenuItem to="/" icon={faArrowRightFromBracket} text="Salir" />
    </>
  );
};
