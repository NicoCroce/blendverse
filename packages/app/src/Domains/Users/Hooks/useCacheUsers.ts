import { _usersService } from '../UserService';

export const useCacheUsers = () => _usersService.useUtils().users.getAll;
