import { asClass } from 'awilix';
import { AssociateUserToProfile, GetAllProfilesByUser } from './Application';
import { UserprofilesRepositoryImplementation } from './Infrastructure';

export const userprofileApp = {
  userprofilesRepository: asClass(UserprofilesRepositoryImplementation),
  _associateUserToProfile: asClass(AssociateUserToProfile),
  _getAllProfilesByUser: asClass(GetAllProfilesByUser),
};
