import { QueryClient } from '@tanstack/react-query';

export const registerEventViewport = (queryClient: QueryClient) => {
  setStoreIsMobile(window.innerWidth, queryClient);
  window.addEventListener('resize', (event: UIEvent) => {
    const target = event.currentTarget as Window;
    setStoreIsMobile(target.innerWidth, queryClient);
  });
};

const setStoreIsMobile = (width: number, queryClient: QueryClient) => {
  const isMobile = width <= 768;
  if (queryClient.getQueryData(['isMobile']) !== isMobile)
    queryClient.setQueryData(['isMobile'], isMobile);
};
