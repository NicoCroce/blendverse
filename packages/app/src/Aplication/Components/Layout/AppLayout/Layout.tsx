import { App } from '@app/App';
import { NavBar } from '../NavBar/NavBar';
import { Header } from '../Header';

import clsx from 'clsx';

import './Layout.css';
import { usePublicPages } from '@app/Aplication/Hooks';

export const Layout = () => {
  const isPublicPage = usePublicPages();

  if (isPublicPage) {
    return (
      <main className="main">
        <App />
      </main>
    );
  }

  const layoutStyle = clsx({
    layout: !isPublicPage,
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
