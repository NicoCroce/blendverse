import { PermissionsService } from '../Auth.service';

export const useGetRoles = () => {
  return PermissionsService.getRoles.useQuery(undefined, {
    staleTime: 1 * 60 * 1000,
    gcTime: 1 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};
