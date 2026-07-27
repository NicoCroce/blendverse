import { executeUseCase, IPaginationResponse } from '@server/Application';
import { DisclaimerAcceptance, IEmployeeRecord } from '../Domain';
import {
  IGetDisclaimerText,
  IGetSignatureStatus,
  ISignDisclaimer,
  IGetEmployeesByCompany,
  ISendReminders,
  ISendRemindersResponse,
} from './disclaimer.types';
import {
  GetDisclaimerText,
  GetSignatureStatus,
  IGetSignatureStatusResponse,
  SignDisclaimer,
} from './UseCases';
import { GetEmployeesByCompany } from './UseCases/GetEmployeesByCompany.usecase';
import { SendReminders } from './UseCases/SendReminders.usecase';

export class DisclaimerService {
  constructor(
    private readonly _getDisclaimerText: GetDisclaimerText,
    private readonly _getSignatureStatus: GetSignatureStatus,
    private readonly _signDisclaimer: SignDisclaimer,
    private readonly _getEmployeesByCompany: GetEmployeesByCompany,
    private readonly _sendReminders: SendReminders,
  ) {}

  async getDisclaimerText({
    input,
    requestContext,
  }: IGetDisclaimerText): Promise<string> {
    return executeUseCase({
      useCase: this._getDisclaimerText,
      input,
      requestContext,
    });
  }

  async getSignatureStatus({
    input,
    requestContext,
  }: IGetSignatureStatus): Promise<IGetSignatureStatusResponse | null> {
    return executeUseCase({
      useCase: this._getSignatureStatus,
      input,
      requestContext,
    });
  }

  async signDisclaimer({
    input,
    requestContext,
  }: ISignDisclaimer): Promise<DisclaimerAcceptance> {
    return executeUseCase({
      useCase: this._signDisclaimer,
      input,
      requestContext,
    });
  }

  async getEmployeesByCompany({
    input,
    requestContext,
  }: IGetEmployeesByCompany): Promise<IPaginationResponse<IEmployeeRecord[]>> {
    return executeUseCase({
      useCase: this._getEmployeesByCompany,
      input,
      requestContext,
    });
  }

  async sendReminders({
    input,
    requestContext,
  }: ISendReminders): Promise<ISendRemindersResponse> {
    return executeUseCase({
      useCase: this._sendReminders,
      input,
      requestContext,
    });
  }
}
