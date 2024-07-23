import './App.css';
import { Outlet } from 'react-router-dom';
import { NavBar } from './Aplication/Components/NavBar/NavBar';

export const App = () => {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
};
