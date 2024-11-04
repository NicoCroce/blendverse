import { Routes } from 'react-router-dom';
import { Toaster } from './Aplication/Components/ui/sonner';
import { AnimatePresence } from 'framer-motion';

import { AllRoutes } from './Infrastructure';

import './App.css';
import { ChangePasswordModal } from './Domains/Users/Components/ChangePassword/ChangePasswordModal';

export const App = () => {
  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {AllRoutes}
        </Routes>
        <ChangePasswordModal />
      </AnimatePresence>
      <Toaster richColors />
    </>
  );
};
