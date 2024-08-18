import { UsersService } from '../UserService';

export const useGetUsers = () => UsersService.userList.useQuery();
