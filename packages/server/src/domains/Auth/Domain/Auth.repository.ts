import { IRequestContext } from '@server/Application';

export interface IRestorePasswordRepository extends IRequestContext {
  mail: string; //mail
}

export interface AuthRepository {
  restorePassword(params: IRestorePasswordRepository): Promise<void>;
}
