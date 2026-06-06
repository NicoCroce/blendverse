import { useURLParams } from '@app/Application/Hooks/useURLParams';
import { TUserSearch } from '../User.entity';
import { UsersService } from '../Users.service';

export const useGetUsers = () => {
  const { searchParams } = useURLParams<TUserSearch>();
  return UsersService.getAll.useQuery(searchParams, {
    staleTime: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev,
  });
};
