import { asClass } from 'awilix';
import {
  OwnersyssService,
  GetAllOwnersyss,
  GetOwnersys,
  CreateOwnersys,
  DeleteOwnersys,
  UpdateOwnersys,
  GetSelectOwnersys,
  ChangeTheme,
  GetOwnerTheme,
} from './Application';
import {
  OwnersyssController,
  OwnersyssRepositoryImplementation,
} from './Infrastructure';
import { container } from '@server/utils/Container';

export const ownersysApp = {
  ownersyssRepository: asClass(OwnersyssRepositoryImplementation),
  ownersyssService: asClass(OwnersyssService),
  ownersyssController: asClass(OwnersyssController),
  _getAllOwnersyss: asClass(GetAllOwnersyss),
  _getSelectOwnersys: asClass(GetSelectOwnersys),
  _getOwnersys: asClass(GetOwnersys),
  _createOwnersys: asClass(CreateOwnersys),
  _deleteOwnersys: asClass(DeleteOwnersys),
  _updateOwnersys: asClass(UpdateOwnersys),
  _changeTheme: asClass(ChangeTheme),
  _getOwnerTheme: asClass(GetOwnerTheme),
};

export const ownersyssController = () =>
  container.resolve<OwnersyssController>('ownersyssController');
