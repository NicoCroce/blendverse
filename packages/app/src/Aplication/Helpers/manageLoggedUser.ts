import { QueryClient } from '@tanstack/react-query';

export const setLoggedUser = <T>(data: T) => {
  return localStorage.setItem('dataUser', JSON.stringify(data));
};

export const removeLoggedUser = () => {
  return localStorage.removeItem('dataUser');
};

export const getLoggedUser = () => {
  try {
    const savedUserData = localStorage.getItem('dataUser');
    if (savedUserData) {
      return JSON.parse(savedUserData);
    }
  } catch (error) {
    console.error('Error parsing JSON from localStorage:', error);
  }
};

export const setUserStore = (trpcClientApi: QueryClient) => {
  const userData = getLoggedUser();
  trpcClientApi.setQueryData(['dataUser'], userData);
};
