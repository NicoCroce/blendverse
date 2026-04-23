import { asClass } from 'awilix';
import {
  OwnersyssService,
  ChangeTheme,
  GetOwnerTheme,
  GetOwnersys,
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
  _getOwnersys: asClass(GetOwnersys),
  _changeTheme: asClass(ChangeTheme),
  _getOwnerTheme: asClass(GetOwnerTheme),
};

export const ownersyssController = () =>
  container.resolve<OwnersyssController>('ownersyssController');
