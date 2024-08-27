import { UsersService } from '../UserService';
import { useCacheUsers } from './useCacheUsers';

export const useAddUser = () => {
  //**  Accedo a los datos almacenados en tRPC. */
  const cacheUserList = useCacheUsers();

  return UsersService.create.useMutation({
    onMutate: async ({ name, mail }) => {
      cacheUserList.cancel();
      const preservedState = cacheUserList.getData();
      type TData = typeof preservedState;

      const setState = (state: TData): TData => [
        ...(state || []),
        {
          id: String(state?.length),
          name,
          mail,
        },
      ];

      cacheUserList.setData(undefined, setState);
      return { preservedState };
    },
    onError: (_err, _variables, context) => {
      cacheUserList.setData(undefined, context?.preservedState);
    },
    onSuccess: () => cacheUserList.invalidate(),
  });
};
