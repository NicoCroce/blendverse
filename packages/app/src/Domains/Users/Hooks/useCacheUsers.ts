import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { UsersService } from '../Users.service';
import { TUser, TUserSearch } from '../User.entity';

type TCachedUsersResponse = { data: TUser[] };

export const useCacheUsers = () => {
  const queryClient = useQueryClient();
  const key = getQueryKey(UsersService.getAll);
  return {
    getData: (params?: TUserSearch) =>
      queryClient.getQueryData<TCachedUsersResponse>(
        getQueryKey(UsersService.getAll, params),
      ),
    invalidate: () => queryClient.invalidateQueries({ queryKey: key }),
  };
};
