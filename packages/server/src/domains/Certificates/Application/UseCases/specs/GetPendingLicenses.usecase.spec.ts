import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { GetPendingLicenses } from '../GetPendingLicenses.usecase';

const requestContext = new RequestContext(1, 'req-1', 42);

describe('GetPendingLicenses (US3 — licencias pendientes de aprobación)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delegates to the repository with the requestContext and returns the pending records', async () => {
    const records = [
      {
        employeeId: 1,
        employeeName: 'María López',
        licenseType: 'Particular',
        startDate: '2026-08-10',
        endDate: '2026-08-12',
        daysSinceRequest: 3,
      },
      {
        employeeId: 2,
        employeeName: 'Carlos Gómez',
        licenseType: 'Enfermedad',
        startDate: '2026-08-11',
        endDate: '2026-08-13',
        daysSinceRequest: 1,
      },
    ];
    const mockRepo = {
      getPendingLicenses: vi.fn().mockResolvedValue(records),
    };

    const useCase = new GetPendingLicenses(mockRepo as never);
    const result = await useCase.execute({ requestContext });

    expect(mockRepo.getPendingLicenses).toHaveBeenCalledWith({
      requestContext,
    });
    expect(requestContext.values.ownerId).toBe(42);
    // La antigüedad (daysSinceRequest) viaja con cada registro (US3)
    expect(result[0].daysSinceRequest).toBe(3);
    expect(result).toEqual(records);
  });

  it('returns an empty list when there are no pending licenses', async () => {
    const mockRepo = {
      getPendingLicenses: vi.fn().mockResolvedValue([]),
    };

    const useCase = new GetPendingLicenses(mockRepo as never);
    const result = await useCase.execute({ requestContext });

    expect(result).toEqual([]);
  });
});
