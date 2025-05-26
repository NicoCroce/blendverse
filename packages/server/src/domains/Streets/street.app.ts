import { asClass } from 'awilix';
import { StreetsService } from './Application';
import {
  StreetsController,
  StreetsRepositoryImplementation,
} from './Infrastructure';
import {
  GetAllStreets,
  GetStreet,
  CreateStreet,
  DeleteStreet,
  UpdateStreet,
} from './Domain';
import { container } from '@server/utils/Container';

export const streetApp = {
  streetsRepository: asClass(StreetsRepositoryImplementation),
  streetsService: asClass(StreetsService),
  streetsController: asClass(StreetsController),
  _getAllStreets: asClass(GetAllStreets),
  _getStreet: asClass(GetStreet),
  _create: asClass(CreateStreet),
  _delete: asClass(DeleteStreet),
  _update: asClass(UpdateStreet),
};

export const streetsController = () =>
  container.resolve<StreetsController>('streetsController');
