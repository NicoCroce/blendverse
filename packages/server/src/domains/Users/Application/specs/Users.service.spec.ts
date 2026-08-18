import { RequestContext } from '@server/Application';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersService } from '../Users.service';

vi.mock('@server/Application/Adapters/ExecuteUseCase', () => ({
  executeUseCase: vi.fn(),
}));

import { executeUseCase as executeUseCaseMock } from '@server/Application/Adapters/ExecuteUseCase';

describe('UsersService', () => {
  const requestContext = new RequestContext(1, 'req-1', 10);
  const changePasswordUseCase = {} as never;

  beforeEach(() => vi.clearAllMocks());

  const buildService = () =>
    new UsersService(changePasswordUseCase, {} as never, {} as never);

  it('delegates changePassword to executeUseCase', async () => {
    vi.mocked(executeUseCaseMock).mockResolvedValue(undefined);

    const service = buildService();
    const input = {
      password: 'old',
      newPassword: 'new',
      rePassword: 'new',
    };

    await expect(
      service.changePassword({
        input,
        requestContext,
      }),
    ).resolves.toBeUndefined();

    expect(executeUseCaseMock).toHaveBeenCalledWith({
      useCase: changePasswordUseCase,
      input,
      requestContext,
    });
  });
});
