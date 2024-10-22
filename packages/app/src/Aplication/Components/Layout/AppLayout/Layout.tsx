import { App } from '@app/App';
import { NavBar } from '../NavBar';
import { Header } from '../Header';
import { useLocation } from 'react-router-dom';
import { AUTH_ROUTE, RESTORE_PASSWORD } from '@app/Domains/Auth';
import clsx from 'clsx';

import './Layout.css';

export const Layout = () => {
  const { pathname } = useLocation();
  const isLoginPage = pathname === AUTH_ROUTE || pathname === RESTORE_PASSWORD;

  const layoutStyle = clsx('layout', {
    'login-page': isLoginPage,
  });

  return (
    <div className={layoutStyle}>
      <Header />
      {!isLoginPage && <NavBar className="is-desktop" />}
      <main className="main">
        <App />
      </main>
    </div>
  );
};
