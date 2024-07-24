import { PRODUCTS_ROUTE } from '@app/Domains/Products/ProductsRoutes';
import { USERS_ROUTE } from '@app/Domains/Users/UsersRoutes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faUser } from '@fortawesome/free-solid-svg-icons';
import { NavLink, NavLinkRenderProps } from 'react-router-dom';

const styleLink =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary';

export const NavBar = () => {
  const isActiveLink = ({ isActive }: NavLinkRenderProps): string => {
    return isActive ? styleLink + ' bg-muted' : styleLink;
  };

  return (
    <header>
      <nav className="flex gap-2 p-4">
        <NavLink to={USERS_ROUTE} className={isActiveLink}>
          <FontAwesomeIcon icon={faUser} />
          Usuarios
        </NavLink>
        <NavLink to={PRODUCTS_ROUTE} className={isActiveLink}>
          <FontAwesomeIcon icon={faFile} />
          Productos
        </NavLink>
      </nav>
    </header>
  );
};
