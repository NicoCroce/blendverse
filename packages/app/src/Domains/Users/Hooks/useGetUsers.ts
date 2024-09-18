import { UsersService } from '../Users.service';

export const useGetUsers = () => UsersService.getAll.useQuery();
