import { UsersServices } from '../Services';

export const useGetUsers = () => UsersServices.userList.useQuery();
