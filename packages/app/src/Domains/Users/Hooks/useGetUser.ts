import { useEffect, useMemo, useState } from 'react';
import { UsersService } from '../UserService';
import { TUser } from '../User.entity';
import { useCacheUsers } from './useCacheUsers';

export const useGetUser = (id: string) => {
  const [currentUser, setCurrentUser] = useState<TUser | null>(null);
  const queryProductDetail = UsersService.get.useQuery(id, {
    enabled: false,
  });
  const cacheUsersList = useCacheUsers();
  const { isFetched, isFetching, refetch } = queryProductDetail;

  // Extraemos los datos de la caché si es que existe.
  const cachedProduct = useMemo(
    () =>
      cacheUsersList.getData()?.find((product) => product.id === id) || null,
    [cacheUsersList, id],
  );

  useEffect(() => {
    // Si el producto está en caché, lo usamos, de lo contrario, hacemos fetch
    if (cachedProduct) {
      setCurrentUser(cachedProduct);
    } else if (!isFetching && !isFetched) {
      refetch().then((res) => {
        setCurrentUser(res.data || null);
      });
    }
  }, [id, isFetching, isFetched, refetch, cachedProduct]);

  return {
    currentUser,
    ...queryProductDetail,
  };
};
