import { describe, expect, it, vi } from 'vitest';
import { GetOwnerTheme } from '../GetOwnerTheme.usecase';
import { RequestContext } from '@server/Application';

const requestContext = new RequestContext(1, 'req-1', 10);

describe('GetOwnerTheme usecase', () => {
  it('returns the theme id from the repository when set', async () => {
    const repository = { getOwnerTheme: vi.fn().mockResolvedValue(4) };

    const useCase = new GetOwnerTheme(repository as never);
    const result = await useCase.execute({ requestContext });

    expect(result).toBe(4);
    expect(repository.getOwnerTheme).toHaveBeenCalledWith({ requestContext });
  });

  it('returns 1 as default when repository returns null', async () => {
    const repository = { getOwnerTheme: vi.fn().mockResolvedValue(null) };

    const useCase = new GetOwnerTheme(repository as never);
    const result = await useCase.execute({ requestContext });

    expect(result).toBe(1);
  });

  it('propagates ownerId via requestContext', async () => {
    const repository = { getOwnerTheme: vi.fn().mockResolvedValue(2) };
    const ctx = new RequestContext(1, 'req-1', 99);

    const useCase = new GetOwnerTheme(repository as never);
    await useCase.execute({ requestContext: ctx });

    expect(repository.getOwnerTheme).toHaveBeenCalledWith(
      expect.objectContaining({ requestContext: ctx }),
    );
  });
});
