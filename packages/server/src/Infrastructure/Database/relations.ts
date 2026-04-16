import { relatePermissions } from '@server/domains/Permissions';
import { relateUsers } from '@server/domains/Users';
import { relateUserprofiles } from '@server/domains/Userprofiles';

export const relateModels = () => {
  relateUsers();
  relatePermissions();
  relateUserprofiles();
};
