import {
  USERS_CHANGE_PASSWORD,
  USERS_ROUTE,
} from '@app/Domains/Users/Users.routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faArrowRightFromBracket,
  faDashboard,
} from '@fortawesome/free-solid-svg-icons';
import { NavLink, NavLinkRenderProps } from 'react-router-dom';
import { Container } from '../Container';
import { NavBarHeader } from './NavBarHeader';
import { useDevice } from '@app/Aplication/Hooks';
import { MAIN_ROUTE } from '@app/Domains/Main';
import { useHasPermission } from '@app/Aplication/Hooks/useHasPermission';

export const styleLink =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary';

export const NavBar = ({ className = '' }: { className?: string }) => {
  const { isMobile } = useDevice();
  const { hasPermission } = useHasPermission();

  const isActiveLink = ({ isActive }: NavLinkRenderProps): string => {
    return isActive ? styleLink + ' bg-muted' : styleLink;
  };

  return (
    <aside className={`navbar pt-6 md:pt-14 ${className}`}>
      <NavBarHeader />
      <nav className="flex flex-col h-full justify-between mt-4">
        <Container space="none">
          {hasPermission('dashboard-access') && (
            <Container className="flex flex-col gap-2 md:p-4">
              <NavLink to={MAIN_ROUTE} className={isActiveLink}>
                <FontAwesomeIcon icon={faDashboard} />
                Dashboard
              </NavLink>
            </Container>
          )}
          <Container className="flex flex-col gap-2 md:p-4">
            <NavLink to={USERS_ROUTE} className={isActiveLink}>
              <FontAwesomeIcon icon={faUser} />
              Usuarios
            </NavLink>
          </Container>
        </Container>
        <Container className="flex flex-col gap-2 md:p-4">
          {isMobile ? (
            <NavLink to={USERS_CHANGE_PASSWORD} className={styleLink}>
              <FontAwesomeIcon icon={faUser} />
              Mi cuenta
            </NavLink>
          ) : null}
          <NavLink to="/" className={styleLink}>
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
            Salir
          </NavLink>
        </Container>
      </nav>
    </aside>
  );
};
