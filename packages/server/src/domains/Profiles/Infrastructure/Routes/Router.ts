import { router } from '@server/Infrastructure/trpc';
import { ProfileRoutes } from './ProfileRoutes';

const ProfileRouter = () => router(ProfileRoutes());
export type TProfileRouter = ReturnType<typeof ProfileRouter>;
