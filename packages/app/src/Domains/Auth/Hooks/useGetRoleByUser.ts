import { PermissionsService } from '../Auth.service';

export const useGetRoleByUser = (userId?: number) => {
  return PermissionsService.getRoleByUser.useQuery(userId as number, {
    enabled: !!userId,
    staleTime: 0,
    gcTime: 0,
  });
};
