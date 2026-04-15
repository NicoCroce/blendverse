import { router } from '@server/Infrastructure/trpc';
import { UserprofileRoutes } from './UserprofileRoutes';

const UserprofileRouter = () => router(UserprofileRoutes());
export type TUserprofileRouter = ReturnType<typeof UserprofileRouter>;
