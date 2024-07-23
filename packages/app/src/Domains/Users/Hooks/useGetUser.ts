import { UsersServices } from '../Services';

export const useGetUser = (userId: string) =>
  UsersServices.userById.useQuery(userId, {
    enabled: false,
  });
