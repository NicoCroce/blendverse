import crypto from 'node:crypto';
import { AppError, IUseCase } from '@server/Application';
import { comparePassword } from '@server/Infrastructure/utils/bcrypt';
import { UserRepository } from '@server/domains/Users';
import { GetCurrentTermsVersion } from '@server/domains/CompanyEmailSettings/Application';
import { DisclaimerAcceptance, DisclaimerRepository } from '../../Domain';
import { ISignDisclaimer, ISignDisclaimerInput } from '../disclaimer.types';

export class SignDisclaimer implements IUseCase<
  DisclaimerAcceptance,
  ISignDisclaimerInput
> {
  constructor(
    private readonly disclaimerRepository: DisclaimerRepository,
    private readonly userRepository: UserRepository,
    private readonly _getCurrentTermsVersion?: GetCurrentTermsVersion,
  ) {}

  async execute({
    input,
    requestContext,
  }: ISignDisclaimer): Promise<DisclaimerAcceptance> {
    if (!Number.isInteger(input.termsVersion) || input.termsVersion < 1) {
      throw new AppError(
        'Debe indicar la versión vigente de los términos',
        400,
        'VALIDATION_ERROR',
      );
    }

    const user = await this.userRepository.validateUser({
      id: requestContext.values.userId,
      requestContext,
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const currentTerms = this._getCurrentTermsVersion
      ? await this._getCurrentTermsVersion.execute({ requestContext })
      : null;
    if (!currentTerms) {
      throw new AppError(
        'Los términos vigentes no están disponibles',
        409,
        'STALE_TERMS_VERSION',
      );
    }
    if (input.termsVersion !== currentTerms.version) {
      throw new AppError(
        'Los términos mostrados están desactualizados',
        409,
        'STALE_TERMS_VERSION',
      );
    }

    const isPasswordValid = await comparePassword(
      input.password,
      user.password || '',
    );

    if (!isPasswordValid) {
      throw new AppError('Contraseña incorrecta', 401);
    }

    const now = new Date();
    now.setMilliseconds(0);
    const secret = process.env.SECRET_KEY_BACK || 'default-secret';
    const payload = `${requestContext.values.userId}:${now.toISOString()}`;
    const hash = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return this.disclaimerRepository.sign({
      hash,
      ip: input.ip,
      userAgent: input.userAgent ?? null,
      timestamp: now,
      termsVersionId: currentTerms.id,
      requestContext,
    });
  }
}
