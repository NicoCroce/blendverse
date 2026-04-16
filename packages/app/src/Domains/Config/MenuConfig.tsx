import { MenuItem } from '@app/Aplication';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { CONFIG_ROUTE } from './Config.routes';

export const MenuConfig = () => {
  return (
    <>
      <MenuItem to={CONFIG_ROUTE} icon={faGear} text="Configurar" />
    </>
  );
};
