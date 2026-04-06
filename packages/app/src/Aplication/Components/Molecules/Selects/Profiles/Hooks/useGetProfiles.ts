import { TProfileRouter } from '@server/domains/Profiles';
import { createTRPCReact } from '@trpc/react-query';

const _profilesService = createTRPCReact<TProfileRouter>();
const ProfilesService = _profilesService.profiles;

export type TProfileSearch = {
  denominacion?: string;
};

export const useGetProfiles = (search: string) => {
  return ProfilesService.getSelect.useQuery(
    { denominacion: search },
    {
      staleTime: 10000,
      enabled: !search || search.length >= 2,
    },
  );
};
