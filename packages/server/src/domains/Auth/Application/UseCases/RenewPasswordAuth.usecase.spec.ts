import { RequestContext, executeUseCase } from '@server/Application';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RenewPasswordAuth } from './RenewPasswordAuth.usecase';

vi.mock('@server/domains/Users', () => ({
  RenewPassword: class RenewPassword {},
}));

vi.mock('@server/Application', async () => {
  const actual = await vi.importActual<typeof import('@server/Application')>(
    '@server/Application',
  );
  return { ...actual, executeUseCase: vi.fn() };
});

describe('RenewPasswordAuth usecase', () => {
  const requestContext = new RequestContext(1, 'req-1', 10);

  beforeEach(() => vi.clearAllMocks());

  it('delegates to executeUseCase with the input and requestContext', async () => {
    vi.mocked(executeUseCase).mockResolvedValue(undefined as never);

    const renewPassword = {} as never;
    const useCase = new RenewPasswordAuth(renewPassword);

    await useCase.execute({
      input: {
        mail: 'user@test.com',
        newPassword: 'newPass1',
        rePassword: 'newPass1',
      },
      requestContext,
    });

    expect(executeUseCase).toHaveBeenCalledWith(
      expect.objectContaining({
        useCase: renewPassword,
        input: {
          mail: 'user@test.com',
          newPassword: 'newPass1',
          rePassword: 'newPass1',
        },
        requestContext,
      }),
    );
  });
});
