import crypto from 'node:crypto';
import { IUseCase } from '@server/Application';
import { DisclaimerRepository } from '../../Domain';
import { GetCurrentTermsVersion } from '@server/domains/CompanyEmailSettings/Application';
import { IGetSignatureStatus } from '../disclaimer.types';

export class GetSignatureStatus implements IUseCase<IGetSignatureStatusResponse | null> {
  constructor(
    private readonly disclaimerRepository: DisclaimerRepository,
    private readonly _getCurrentTermsVersion?: GetCurrentTermsVersion,
  ) {}

  private computeHash(userId: number, timestamp: string): string {
    const secret = process.env.SECRET_KEY_BACK || 'default-secret';
    const payload = `${userId}:${timestamp}`;
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  async execute({
    requestContext,
  }: IGetSignatureStatus): Promise<IGetSignatureStatusResponse | null> {
    const currentTerms = this._getCurrentTermsVersion
      ? await this._getCurrentTermsVersion.execute({ requestContext })
      : null;
    if (!currentTerms) return null;

    const record = await this.disclaimerRepository.getStatus({
      termsVersionId: currentTerms.id,
      requestContext,
    });

    if (!record) return null;

    const storedHash = record.values.hash_prueba;
    const expectedHash = this.computeHash(
      requestContext.values.userId,
      record.values.timestamp instanceof Date
        ? record.values.timestamp.toISOString()
        : String(record.values.timestamp),
    );

    const corrupt = storedHash !== expectedHash;

    return {
      signed: !corrupt,
      hash: storedHash,
      timestamp: record.values.timestamp,
      ip: record.values.ip,
      corrupt,
    };
  }
}

export interface IGetSignatureStatusResponse {
  signed: boolean;
  hash: string;
  timestamp: Date | string;
  ip: string;
  corrupt: boolean;
}
