import { _usersService } from '../Users.service';

export const useCacheUsers = () => _usersService.useUtils().users.getAll;
