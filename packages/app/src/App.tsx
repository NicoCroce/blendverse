import './App.css';
import { Outlet } from 'react-router-dom';
import { NavBar } from './Aplication/Components/NavBar/NavBar';
import { Toaster } from './Aplication/Components/ui/sonner';

export const App = () => {
  return (
    <>
      <NavBar />
      <Outlet />
      <Toaster />
    </>
  );
};
