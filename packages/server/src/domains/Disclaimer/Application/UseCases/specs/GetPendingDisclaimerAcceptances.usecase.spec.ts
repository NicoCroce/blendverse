import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { GetPendingDisclaimerAcceptances } from '../GetPendingDisclaimerAcceptances.usecase';

const requestContext = new RequestContext(1, 'req-1', 42);

describe('GetPendingDisclaimerAcceptances (US5 — términos sin aceptar)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delegates to the repository with the requestContext and returns employees without acceptance', async () => {
    const records = [
      {
        employeeId: 4,
        employeeName: 'Ana Ruiz',
        employeeEmail: 'ana@test.com',
      },
    ];
    const mockRepo = {
      getEmployeesWithoutDisclaimerAcceptance: vi
        .fn()
        .mockResolvedValue(records),
    };

    const useCase = new GetPendingDisclaimerAcceptances(mockRepo as never);
    const result = await useCase.execute({ requestContext });

    expect(
      mockRepo.getEmployeesWithoutDisclaimerAcceptance,
    ).toHaveBeenCalledWith({ requestContext });
    expect(requestContext.values.ownerId).toBe(42);
    expect(result).toEqual(records);
  });

  it('returns an empty list when every employee accepted the terms', async () => {
    const mockRepo = {
      getEmployeesWithoutDisclaimerAcceptance: vi.fn().mockResolvedValue([]),
    };

    const useCase = new GetPendingDisclaimerAcceptances(mockRepo as never);
    const result = await useCase.execute({ requestContext });

    expect(result).toEqual([]);
  });
});
