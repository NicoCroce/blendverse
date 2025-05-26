import {
  IDeleteStreetRepository,
  IGetStreetRepository,
  IGetStreetsRepository,
  ICreateStreetRepository,
  IUpdateStreetRepository,
  Street,
  StreetsRepository,
} from '../../Domain';
import { LocalDatabaseStreets } from './Local.database';

export class StreetsRepositoryImplementation implements StreetsRepository {
  private Db = new LocalDatabaseStreets();

  async getAllStreets({
    requestContext: _R,
    filters,
  }: IGetStreetsRepository): Promise<Street[]> {
    const data = await this.Db.getAll(filters?.denominacion);
    return data.map(({ id, denominacion }) => new Street(denominacion, id));
  }
  create(_params: ICreateStreetRepository): Promise<Street | null> {
    throw new Error('Method not implemented.');
  }
  update(_params: IUpdateStreetRepository): Promise<number | null> {
    throw new Error('Method not implemented.');
  }
  delete(_params: IDeleteStreetRepository): Promise<number | null> {
    throw new Error('Method not implemented.');
  }
  getStreet(_params: IGetStreetRepository): Promise<Street | null> {
    throw new Error('Method not implemented.');
  }
}
