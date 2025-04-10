import { Routes } from 'react-router-dom';
import { Toaster } from './Aplication/Components/ui/sonner';

import { AllRoutes } from './Infrastructure';

import './App.css';
import { ChangePasswordModal } from './Domains/Users/Components/ChangePassword/ChangePasswordModal';
import { usePublicPages } from './Aplication';

export const App = () => {
  const isPublicPage = usePublicPages();
  return (
    <>
      <Routes>{AllRoutes}</Routes>
      {!isPublicPage && <ChangePasswordModal />}
      <Toaster richColors />
    </>
  );
};
