import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from '../../ui/menubar';
import { faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { Container } from '../../Layout';
import { Link } from 'react-router-dom';
import { USERS_CHANGE_PASSWORD } from '@app/Domains/Users';

export const AccountMenu = () => {
  return (
    <Container block className="justify-self-end">
      <Menubar className="inline-block">
        <MenubarMenu>
          <MenubarTrigger className="flex gap-4">
            <FontAwesomeIcon icon={faUser} /> Mi cuenta
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem className="flex gap-4">
              <Link to={USERS_CHANGE_PASSWORD}>
                <FontAwesomeIcon icon={faLock} /> Cambiar contraseña
              </Link>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </Container>
  );
};
