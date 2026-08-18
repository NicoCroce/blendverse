import { describe, expect, it, vi } from 'vitest';
import { RequestContext } from '@server/Application';
import { GetDisclaimerText } from '../GetDisclaimerText.usecase';
import { SignDisclaimer } from '../SignDisclaimer.usecase';

vi.mock('@server/Infrastructure/utils/bcrypt', () => ({
  comparePassword: vi.fn().mockResolvedValue(true),
}));

const context = new RequestContext(7, 'terms-acceptance', 41);

describe('Disclaimer terms version integration', () => {
  it('reads the current CompanyEmailSettings terms and does not fall back to legacy content', async () => {
    const ownersysRepository = { getOwnersys: vi.fn() };
    const currentTerms = {
      execute: vi
        .fn()
        .mockResolvedValue({
          id: 12,
          version: 3,
          content: '<p>Published legal text</p>',
        }),
    };
    const useCase = new GetDisclaimerText(
      ownersysRepository as never,
      currentTerms as never,
    );

    await expect(
      useCase.execute({ input: undefined, requestContext: context }),
    ).resolves.toEqual({
      content: '<p>Published legal text</p>',
      version: 3,
    });
    expect(currentTerms.execute).toHaveBeenCalledWith({
      requestContext: context,
    });
    expect(ownersysRepository.getOwnersys).not.toHaveBeenCalled();
  });

  it('rejects an acceptance tied to a stale displayed version and stores the current version on success', async () => {
    const userRepository = {
      validateUser: vi.fn().mockResolvedValue({ password: 'hashed' }),
    };
    const disclaimerRepository = {
      sign: vi.fn().mockResolvedValue({ values: { terms_version_id: 12 } }),
    };
    const currentTerms = {
      execute: vi
        .fn()
        .mockResolvedValue({ id: 12, version: 3, content: '<p>Current</p>' }),
    };
    const useCase = new SignDisclaimer(
      disclaimerRepository as never,
      userRepository as never,
      currentTerms as never,
    );

    await expect(
      useCase.execute({
        input: {
          password: 'secret',
          ip: '127.0.0.1',
          userAgent: 'Vitest',
          termsVersion: 2,
        },
        requestContext: context,
      }),
    ).rejects.toMatchObject({ errorCode: 'STALE_TERMS_VERSION' });
    expect(disclaimerRepository.sign).not.toHaveBeenCalled();

    await useCase.execute({
      input: {
        password: 'secret',
        ip: '127.0.0.1',
        userAgent: 'Vitest',
        termsVersion: 3,
      },
      requestContext: context,
    });
    expect(disclaimerRepository.sign).toHaveBeenCalledWith(
      expect.objectContaining({ termsVersionId: 12, requestContext: context }),
    );
  });
});
