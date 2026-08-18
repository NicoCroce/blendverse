import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { GetExpiringLicenses } from '../GetExpiringLicenses.usecase';

const requestContext = new RequestContext(1, 'req-1', 42);

describe('GetExpiringLicenses (US7 — licencias que vencen esta semana)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delegates to the repository with the requestContext and returns the expiring records', async () => {
    const records = [
      {
        employeeId: 1,
        employeeName: 'Laura Fernández',
        licenseType: 'Maternidad',
        endDate: '2026-08-12',
      },
    ];
    const mockRepo = {
      getExpiringLicenses: vi.fn().mockResolvedValue(records),
    };

    const useCase = new GetExpiringLicenses(mockRepo as never);
    const result = await useCase.execute({ requestContext });

    expect(mockRepo.getExpiringLicenses).toHaveBeenCalledWith({
      requestContext,
    });
    expect(requestContext.values.ownerId).toBe(42);
    expect(result).toEqual(records);
  });

  it('returns an empty list when no license expires within the week', async () => {
    const mockRepo = {
      getExpiringLicenses: vi.fn().mockResolvedValue([]),
    };

    const useCase = new GetExpiringLicenses(mockRepo as never);
    const result = await useCase.execute({ requestContext });

    expect(result).toEqual([]);
  });
});
