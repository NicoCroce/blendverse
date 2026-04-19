import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { UsersService } from '../Users.service';

export const useCacheUsers = () => {
  const queryClient = useQueryClient();
  const key = getQueryKey(UsersService.getAll);
  return {
    getData: () => queryClient.getQueryData(key),
    invalidate: () => queryClient.invalidateQueries({ queryKey: key }),
  };
};
