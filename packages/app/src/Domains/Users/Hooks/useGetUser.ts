import { useEffect, useMemo, useState } from 'react';
import { UsersService } from '../Users.service';
import { TUser, TUserSearch } from '../User.entity';
import { useCacheUsers } from './useCacheUsers';
import { useURLParams } from '@app/Aplication/Hooks/useURLParams';

export const useGetUser = (id?: number) => {
  const { searchParams } = useURLParams<TUserSearch>();
  const [currentUser, setCurrentUser] = useState<TUser | null>(null);
  const queryUserDetail = UsersService.get.useQuery(id || 0, {
    enabled: false,
  });
  const cacheUsersList = useCacheUsers();
  const { isFetched, isFetching, refetch } = queryUserDetail;

  // Extraemos los datos de la caché si es que existe.
  const cachedUsers = useMemo(
    () =>
      cacheUsersList
        .getData(searchParams)
        ?.data.find((user) => user.id === id) || null,
    [cacheUsersList, id, searchParams],
  );

  useEffect(() => {
    // Si el usuario está en caché, lo usamos, de lo contrario, hacemos fetch
    if (cachedUsers) {
      setCurrentUser(cachedUsers);
    } else if (!isFetching && !isFetched) {
      refetch().then((res) => {
        setCurrentUser(res.data || null);
      });
    }
  }, [id, isFetching, isFetched, refetch, cachedUsers]);

  return {
    currentUser,
    ...queryUserDetail,
  };
};
