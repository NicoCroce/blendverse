import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { GetUpcomingVacations } from '../GetUpcomingVacations.usecase';

const requestContext = new RequestContext(1, 'req-1', 42);

describe('GetUpcomingVacations (US6 — vacaciones próximas 15 días)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delegates to the repository with the requestContext and returns the vacation records', async () => {
    const records = [
      {
        employeeId: 1,
        employeeName: 'Pedro Díaz',
        segmentName: 'Operaciones',
        startDate: '2026-08-16',
        endDate: '2026-08-30',
      },
    ];
    const mockRepo = {
      getUpcomingVacations: vi.fn().mockResolvedValue(records),
    };

    const useCase = new GetUpcomingVacations(mockRepo as never);
    const result = await useCase.execute({ requestContext });

    expect(mockRepo.getUpcomingVacations).toHaveBeenCalledWith({
      requestContext,
    });
    expect(requestContext.values.ownerId).toBe(42);
    expect(result).toEqual(records);
  });

  it('returns an empty list when there are no upcoming vacations in the range', async () => {
    const mockRepo = {
      getUpcomingVacations: vi.fn().mockResolvedValue([]),
    };

    const useCase = new GetUpcomingVacations(mockRepo as never);
    const result = await useCase.execute({ requestContext });

    expect(result).toEqual([]);
  });
});
