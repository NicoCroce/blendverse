import { UsersService } from '../UserService';

export const useGetUsers = () => UsersService.getAll.useQuery();
