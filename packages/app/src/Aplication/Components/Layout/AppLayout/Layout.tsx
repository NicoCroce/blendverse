import { App } from '@app/App';
import { NavBar } from '../NavBar/NavBar';
import { Header } from '../Header';
import { useLocation } from 'react-router-dom';
import { AUTH_ROUTE, RESTORE_PASSWORD } from '@app/Domains/Auth';
import clsx from 'clsx';

import './Layout.css';

const halfPageRoutes = new Set([AUTH_ROUTE, RESTORE_PASSWORD]);

export const Layout = () => {
  const { pathname } = useLocation();
  const isHalfPage = halfPageRoutes.has(pathname);

  if (isHalfPage) {
    return (
      <main className="main">
        <App />
      </main>
    );
  }

  const layoutStyle = clsx({
    layout: !isHalfPage,
  });

  return (
    <div className={layoutStyle}>
      <Header />
      <main className="main">
        <App />
      </main>
      <NavBar className="is-desktop" />
    </div>
  );
};
