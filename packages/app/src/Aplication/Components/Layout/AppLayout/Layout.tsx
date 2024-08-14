import { App } from '@app/App';
import { NavBar } from '../NavBar';
import { Header } from '../Header';
import './Layout.css';

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
