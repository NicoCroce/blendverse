import { Routes } from 'react-router-dom';
import { Toaster } from './Aplication/Components/ui/sonner';

import { AllRoutes } from './Infrastructure';

import './App.css';
import { ChangePasswordModal } from './Domains/Users/Components/ChangePassword/ChangePasswordModal';
import { useChangeTheme } from './Aplication/Hooks/useChangeTheme';
import { usePublicPages } from './Aplication/Hooks/usePublicPages';

export const App = () => {
  const isPublicPage = usePublicPages();
  useChangeTheme();

  return (
    <>
      <Routes>{AllRoutes}</Routes>
      {!isPublicPage && <ChangePasswordModal />}
      <Toaster richColors />
    </>
  );
};
