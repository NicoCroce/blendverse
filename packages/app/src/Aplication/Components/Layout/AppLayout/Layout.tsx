import { App } from '@app/App';
import { NavBar } from '../NavBar';
import { Header } from '../Header';
import { useLocation } from 'react-router-dom';
import { AUTH_ROUTE } from '@app/Domains/Auth';
import clsx from 'clsx';

import './Layout.css';

export const Layout = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === AUTH_ROUTE;

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
