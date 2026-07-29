import { relatePermissions } from '@server/domains/Permissions';
import { relateUsers } from '@server/domains/Users';
import { relateUserprofiles } from '@server/domains/Userprofiles';
import { relateDisclaimer } from '@server/domains/Disclaimer';
import { relateSegments } from '@server/domains/Segments';

export const relateModels = () => {
  relateUsers();
  relatePermissions();
  relateUserprofiles();
  relateDisclaimer();
  relateSegments();
};
