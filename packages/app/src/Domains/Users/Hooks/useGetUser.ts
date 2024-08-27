import { UsersService } from '../UserService';

export const useGetUser = (userId: string) => UsersService.get.useQuery(userId);
