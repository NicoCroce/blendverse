import { useURLParams } from '@app/Aplication/Hooks/useURLParams';
import { TUserSearch } from '../User.entity';
import { UsersService } from '../Users.service';

export const useGetUsers = () => {
  const { searchParams } = useURLParams<TUserSearch>();
  return UsersService.getAll.useQuery(searchParams);
};
