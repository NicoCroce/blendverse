import { describe, expect, it, vi } from 'vitest';
import { GetAllProfilesByUser } from './GetAllProfilesByUser.usecase';
import { RequestContext } from '@server/Application';

const requestContext = new RequestContext(1, 'req-1', 10);

describe('GetAllProfilesByUser usecase', () => {
  it('returns profiles from the repository', async () => {
    const profiles = [{ values: { id: 1, name: 'Default' } }];
    const repository = {
      getAllProfilesByUser: vi.fn().mockResolvedValue(profiles),
    };

    const useCase = new GetAllProfilesByUser(repository as never);
    const result = await useCase.execute({ requestContext });

    expect(result).toBe(profiles);
    expect(repository.getAllProfilesByUser).toHaveBeenCalledWith({
      requestContext,
    });
  });

  it('returns empty array when repository returns null/undefined', async () => {
    const repository = {
      getAllProfilesByUser: vi.fn().mockResolvedValue(null),
    };

    const useCase = new GetAllProfilesByUser(repository as never);
    const result = await useCase.execute({ requestContext });

    expect(result).toEqual([]);
  });
});
