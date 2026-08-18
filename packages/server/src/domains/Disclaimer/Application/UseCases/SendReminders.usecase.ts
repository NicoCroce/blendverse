import { AppError, IUseCase } from '@server/Application';
import { UserRepository } from '@server/domains/Users';
import { OwnersyssRepository } from '@server/domains/Ownersyss';
import { DisclaimerRepository } from '../../Domain';
import { ResolveEmailDeliveryPolicy } from '@server/domains/CompanyEmailSettings/Application';
import { ISendReminders, ISendRemindersResponse } from '../disclaimer.types';
import { GetCurrentTermsVersion } from '@server/domains/CompanyEmailSettings/Application';

const BATCH_SIZE = 50;

export class SendReminders implements IUseCase<
  ISendRemindersResponse,
  ISendRemindersInput
> {
  constructor(
    private readonly disclaimerRepository: DisclaimerRepository,
    private readonly userRepository: UserRepository,
    private readonly disclaimerEmailService: ISendEmailService,
    private readonly ownersyssRepository: OwnersyssRepository,
    private readonly _resolveEmailDeliveryPolicy?: ResolveEmailDeliveryPolicy,
    private readonly _getCurrentTermsVersion?: GetCurrentTermsVersion,
  ) {}

  async execute({
    input,
    requestContext,
  }: ISendReminders): Promise<ISendRemindersResponse> {
    const ownerId = requestContext.values.ownerId;
    const policy = this._resolveEmailDeliveryPolicy
      ? await this._resolveEmailDeliveryPolicy.execute({
          input: { code: 'employee_terms_reminder' },
          requestContext,
        })
      : { enabled: false };
    if (!policy.enabled) return { sent: 0, failed: 0, total: 0 };

    const currentTerms = await this._getCurrentTermsVersion?.execute({
      requestContext,
    });
    if (!currentTerms) {
      throw new AppError(
        'Los términos vigentes no están disponibles',
        409,
        'STALE_TERMS_VERSION',
      );
    }

    const pendingIds =
      input.employeeIds && input.employeeIds.length > 0
        ? input.employeeIds
        : await this.disclaimerRepository.getPendingEmployeeIds({
            termsVersionId: currentTerms.id,
            requestContext,
          });

    const ownersys = await this.ownersyssRepository.getOwnersys({
      id: ownerId,
      requestContext,
    });

    const disclaimerText = currentTerms.content;
    const companyName = ownersys?.values.denominacion || '';

    let sent = 0;
    let failed = 0;

    for (let i = 0; i < pendingIds.length; i += BATCH_SIZE) {
      const batch = pendingIds.slice(i, i + BATCH_SIZE);
      try {
        const emails = await this.userRepository.getEmailsByUsersId({
          userIds: batch,
          requestContext,
        });

        await this.disclaimerEmailService.sendReminder({
          to: emails,
          disclaimerText,
          companyName,
          requestContext,
        });

        sent += batch.length;
      } catch (error) {
        failed += batch.length;
        console.log(error);
      }
    }

    return { sent, failed, total: pendingIds.length };
  }
}

export interface ISendRemindersInput {
  employeeIds?: number[];
}

export interface ISendEmailService {
  sendReminder(params: {
    to: string[];
    disclaimerText: string;
    companyName: string;
    requestContext: import('@server/Application').RequestContext;
  }): Promise<void>;
}
