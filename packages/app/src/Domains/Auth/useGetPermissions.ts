import { PermissionsService } from './Auth.service';

export const useGetPermissions = () => {
  return PermissionsService.getPermissionByUser.useQuery(undefined, {
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};
