import { asClass } from 'awilix';
import {
  ProfilesService,
  GetAllProfiles,
  GetProfile,
  CreateProfile,
  DeleteProfile,
  UpdateProfile,
  GetSelectProfile,
} from './Application';
import {
  ProfilesController,
  ProfilesRepositoryImplementation,
} from './Infrastructure';
import { container } from '@server/utils/Container';

export const profileApp = {
  profilesRepository: asClass(ProfilesRepositoryImplementation),
  profilesService: asClass(ProfilesService),
  profilesController: asClass(ProfilesController),
  _getAllProfiles: asClass(GetAllProfiles),
  _getSelectProfile: asClass(GetSelectProfile),
  _getProfile: asClass(GetProfile),
  _createProfile: asClass(CreateProfile),
  _deleteProfile: asClass(DeleteProfile),
  _updateProfile: asClass(UpdateProfile),
};

export const profilesController = () =>
  container.resolve<ProfilesController>('profilesController');
