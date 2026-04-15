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
} from './Application';
import {
  UserprofilesController,
  UserprofilesRepositoryImplementation,
} from './Infrastructure';
import { UserprofilesRepository } from './Domain';

// Manually create instances to bypass Awilix CLASSIC mode interface resolution issues
let userprofilesControllerInstance: UserprofilesController | null = null;

try {
  const userprofilesRepositoryInstance: UserprofilesRepository =
    new UserprofilesRepositoryImplementation();

  const createUserprofileUC = new CreateUserprofile(
    userprofilesRepositoryInstance,
  );

  const deleteUserprofileUC = new DeleteUserprofile(
    userprofilesRepositoryInstance,
  );

  const updateUserprofileUC = new UpdateUserprofile(
    userprofilesRepositoryInstance,
  );

  const getAllUserprofilesUC = new GetAllUserprofiles(
    userprofilesRepositoryInstance,
  );

  const getUserprofileUC = new GetUserprofile(userprofilesRepositoryInstance);

  const userprofilesServiceInstance = new UserprofilesService(
    createUserprofileUC,
    deleteUserprofileUC,
    updateUserprofileUC,
    getAllUserprofilesUC,
    getUserprofileUC,
    new GetProfileByUserId(userprofilesRepositoryInstance),
  );

  userprofilesControllerInstance = new UserprofilesController(
    userprofilesServiceInstance,
  );
} catch (error) {
  console.error('[Userprofiles] Failed to initialize controller:', error);
}

// Register in Awilix for compatibility, but these won't be used for dependency resolution
export const userprofileApp = {
  userprofilesRepository: asClass(UserprofilesRepositoryImplementation),
  _getAllUserprofiles: asClass(GetAllUserprofiles),
  _getUserprofile: asClass(GetUserprofile),
  _createUserprofile: asClass(CreateUserprofile),
  _deleteUserprofile: asClass(DeleteUserprofile),
  _updateUserprofile: asClass(UpdateUserprofile),
  userprofilesService: asClass(UserprofilesService),
  userprofilesController: asClass(UserprofilesController),
  _associateUserToProfile: asClass(AssociateUserToProfile),
  _getProfileByUserId: asClass(GetProfileByUserId),
};

export const getUserprofilesController = () => {
  if (!userprofilesControllerInstance) {
    throw new Error('[Userprofiles] Controller not initialized');
  }
  return userprofilesControllerInstance;
};
