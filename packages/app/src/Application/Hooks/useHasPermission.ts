import { useGetPermissions } from '@app/Domains/Auth/Hooks/useGetPermissions';

export const useHasPermission = () => {
  const { data } = useGetPermissions();

  const hasPermission = (permission: string | string[]) => {
    if (Array.isArray(permission)) {
      return permission.some((perm) => data?.includes(perm));
    }
    return data?.includes(permission) ?? false;
  };

  return {
    hasPermission,
  };
};
