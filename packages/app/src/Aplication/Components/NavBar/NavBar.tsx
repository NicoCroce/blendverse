import { PRODUCTS_ROUTE } from '@app/Domains/Products/ProductsRoutes';
import { USERS_ROUTE } from '@app/Domains/Users/UsersRoutes';
import { Link } from 'react-router-dom';

export const NavBar = () => {
  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link to={USERS_ROUTE}>Users</Link>
            <Link to={PRODUCTS_ROUTE}>Products</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};
