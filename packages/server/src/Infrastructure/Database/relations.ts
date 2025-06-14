import { relatePermissions } from '@server/domains/Permissions';
import { relateUsers } from '@server/domains/Users';

export const relateModels = () => {
  relateUsers();
  relatePermissions();
};
