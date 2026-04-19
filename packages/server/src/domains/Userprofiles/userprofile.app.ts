import { asClass } from 'awilix';
import {
  UserprofilesService,
  GetAllUserprofiles,
  GetUserprofile,
  CreateUserprofile,
  DeleteUserprofile,
  UpdateUserprofile,
  AssociateUserToProfile,
  GetProfileByUserId,
  GetAllProfilesByUser,
} from './Application';
import {
  UserprofilesController,
  UserprofilesRepositoryImplementation,
} from './Infrastructure';
import { container } from '@server/utils/Container';

export const userprofileApp = {
  userprofilesRepository: asClass(UserprofilesRepositoryImplementation),
  userprofilesService: asClass(UserprofilesService),
  userprofilesController: asClass(UserprofilesController),
  _getAllUserprofiles: asClass(GetAllUserprofiles),
  _getUserprofile: asClass(GetUserprofile),
  _createUserprofile: asClass(CreateUserprofile),
  _deleteUserprofile: asClass(DeleteUserprofile),
  _updateUserprofile: asClass(UpdateUserprofile),
  _associateUserToProfile: asClass(AssociateUserToProfile),
  _getProfileByUserId: asClass(GetProfileByUserId),
  _getAllProfilesByUser: asClass(GetAllProfilesByUser),
};

export const userprofilesController = () =>
  container.resolve<UserprofilesController>('userprofilesController');
