import { IRequestContext, IPaginationResponse } from '@server/Application';
import { DisclaimerAcceptance } from './DisclaimerAcceptance.entity';

export interface IGetSignatureStatusRepository extends IRequestContext {
  userId: number;
  ownerId: number;
}

export interface ISignDisclaimerRepository extends IRequestContext {
  userId: number;
  ownerId: number;
  hash: string;
  ip: string;
  userAgent: string | null;
  timestamp: Date;
}

export interface IGetEmployeesByCompanyRepository extends IRequestContext {
  ownerId?: number;
  search?: string;
  page?: string;
  limit?: string;
}

export interface IGetPendingEmployeeIdsRepository extends IRequestContext {
  ownerId?: number;
}

export interface IEmployeeRecord {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  renovar_clave: boolean;
  estado_firma: 'Pendiente' | 'Firmado' | 'Corrupto';
}

export interface DisclaimerRepository {
  getStatus(
    params: IGetSignatureStatusRepository,
  ): Promise<DisclaimerAcceptance | null>;

  sign(params: ISignDisclaimerRepository): Promise<DisclaimerAcceptance>;

  getEmployeesByCompany(
    params: IGetEmployeesByCompanyRepository,
  ): Promise<IPaginationResponse<IEmployeeRecord[]>>;

  getPendingEmployeeIds(
    params: IGetPendingEmployeeIdsRepository,
  ): Promise<number[]>;
}
