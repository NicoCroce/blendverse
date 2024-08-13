import { App } from '@app/App';
import { NavBar } from '../NavBar';
import './Layout.css';
import { Header } from '../Header';

export const Layout = () => {
  return (
    <div className="layout">
      <Header />
      <NavBar className="is-desktop" />
      <main className="main">
        <App />
      </main>
    </div>
  );
};
