import { RequestContext, executeUseCase } from '@server/Application';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OwnersyssService } from './Ownersyss.service';

vi.mock('@server/Application', async () => {
  const actual = await vi.importActual<typeof import('@server/Application')>(
    '@server/Application',
  );
  return { ...actual, executeUseCase: vi.fn() };
});

describe('OwnersyssService', () => {
  const requestContext = new RequestContext(1, 'req-1', 10);

  beforeEach(() => vi.clearAllMocks());

  it('delegates getOwnersys to executeUseCase', async () => {
    const owner = { id: 10 };
    vi.mocked(executeUseCase).mockResolvedValue(owner as never);

    const service = new OwnersyssService({} as never, {} as never, {} as never);
    const result = await service.getOwnersys({ input: 10, requestContext });

    expect(executeUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ input: 10, requestContext }),
    );
    expect(result).toBe(owner);
  });

  it('delegates updateTheme to executeUseCase', async () => {
    vi.mocked(executeUseCase).mockResolvedValue(3 as never);

    const service = new OwnersyssService({} as never, {} as never, {} as never);
    const result = await service.updateTheme({ input: 3, requestContext });

    expect(executeUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ input: 3, requestContext }),
    );
    expect(result).toBe(3);
  });

  it('delegates getOwnerTheme to executeUseCase', async () => {
    vi.mocked(executeUseCase).mockResolvedValue(2 as never);

    const service = new OwnersyssService({} as never, {} as never, {} as never);
    const result = await service.getOwnerTheme({ requestContext });

    expect(executeUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ requestContext }),
    );
    expect(result).toBe(2);
  });
});
