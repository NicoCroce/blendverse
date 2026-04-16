import { useEffect } from 'react';
import { AuthService } from '../Auth.service';
import { isLogged } from '@app/Aplication/Helpers/isLogged';
import { createIDBPersister } from '@app/Aplication/Helpers/Indexdb';
import { queryClient } from '@app/queryClient';

const persister = createIDBPersister();

const clearStore = async () => {
  localStorage.removeItem('logged');
  queryClient.removeQueries();
  queryClient.getQueryCache().clear();
  queryClient.getMutationCache().clear();
  await persister.removeClient();
  window.location.reload();
};

export const useLogout = () => {
  const { mutate } = AuthService.logout.useMutation({
    onSuccess: async () => {
      await clearStore();
    },
  });

  useEffect(() => {
    if (isLogged()) {
      mutate();
    }
  }, [mutate]);

  return;
};
