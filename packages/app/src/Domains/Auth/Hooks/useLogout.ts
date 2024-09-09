import { useEffect } from 'react';
import { AuthService } from '../AuthService';
import { isLogged } from '@app/Aplication/Helpers/isLogged';

export const useLogout = () => {
  const { mutate } = AuthService.logout.useMutation();

  useEffect(() => {
    console.log(isLogged());
    if (isLogged()) {
      localStorage.removeItem('logged');
      mutate();
    }
  }, [mutate]);

  return;
};
