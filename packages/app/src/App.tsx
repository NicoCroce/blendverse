import { Routes } from 'react-router-dom';
import { Toaster } from './Application/Components/ui/sonner';

import { AllRoutes } from './Infrastructure';

import { ChangePasswordModal } from './Domains/Users/Components/ChangePassword/ChangePasswordModal';
import { useChangeTheme } from './Application/Hooks/useChangeTheme';
import { usePublicPages } from './Application/Hooks/usePublicPages';

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
