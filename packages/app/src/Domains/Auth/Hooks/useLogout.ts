import { useEffect } from 'react';
import { AuthService } from '../Auth.service';
import { isLogged } from '@app/Aplication/Helpers/isLogged';
import { removeLoggedUser } from '@app/Aplication';

export const useLogout = () => {
  const { mutate } = AuthService.logout.useMutation();

  useEffect(() => {
    if (isLogged()) {
      localStorage.removeItem('logged');
      removeLoggedUser();
      mutate();
    }
  }, [mutate]);

  return;
};
