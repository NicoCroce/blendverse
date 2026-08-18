import { useQueryClient } from '@tanstack/react-query';

export const useCacheUsers = () => {
  const queryClient = useQueryClient();
  return {
    invalidate: () => queryClient.invalidateQueries({ queryKey: [['users']] }),
  };
};
