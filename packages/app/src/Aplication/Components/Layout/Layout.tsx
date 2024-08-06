import { App } from '@app/App';
import { NavBar } from '../NavBar/NavBar';
import './Layout.css';

export const Layout = () => {
  return (
    <div className="layout">
      <header></header>
      <NavBar />
      <main className="main">
        <App />
      </main>
    </div>
  );
};
