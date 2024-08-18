import { UsersService } from '../UserService';

export const useGetUser = (userId: string) =>
  UsersService.userById.useQuery(userId);
