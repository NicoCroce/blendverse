import { QueryClient } from '@tanstack/react-query';

export const registerEventViewport = (queryClient: QueryClient) => {
  setStoreIsMobile(window.innerWidth, queryClient);
  window.addEventListener('resize', (event: UIEvent) => {
    const target = event.currentTarget as Window;
    setStoreIsMobile(target.innerWidth, queryClient);
  });
};

export const setStoreIsMobile = (width: number, queryClient: QueryClient) => {
  const isMobile = width <= 768;
  queryClient.setQueryData(['isMobile'], isMobile);
};
