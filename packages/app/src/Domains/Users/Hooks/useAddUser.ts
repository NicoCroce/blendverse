import { UsersServices } from '../Services';

export const useAddUser = () => {
  //**  Accedo a los datos almacenados en tRPC. */
  const cacheUserList = UsersServices.useUtils().userList;

  return UsersServices.userCreate.useMutation({
    onMutate: async ({ name, mail, password }) => {
      cacheUserList.cancel();
      const preservedState = cacheUserList.getData();
      type TData = typeof preservedState;

      const setState = (state: TData): TData => [
        ...(state || []),
        {
          id: String(state?.length),
          name,
          mail,
          password,
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
