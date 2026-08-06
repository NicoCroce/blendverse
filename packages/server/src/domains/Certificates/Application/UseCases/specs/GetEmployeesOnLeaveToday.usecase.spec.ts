import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { GetEmployeesOnLeaveToday } from '../GetEmployeesOnLeaveToday.usecase';

const requestContext = new RequestContext(1, 'req-1', 42);

describe('GetEmployeesOnLeaveToday (US2 — empleados de licencia hoy)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delegates to the repository passing the requestContext (multi-tenant ownerId)', async () => {
    const records = [
      {
        employeeId: 1,
        employeeName: 'Juan Pérez',
        licenseType: 'Enfermedad',
        startDate: '2026-08-05',
        endDate: '2026-08-07',
        returnDate: '2026-08-08',
      },
    ];
    const mockRepo = {
      getEmployeesOnLeaveToday: vi.fn().mockResolvedValue(records),
    };

    const useCase = new GetEmployeesOnLeaveToday(mockRepo as never);
    const result = await useCase.execute({ requestContext });

    expect(mockRepo.getEmployeesOnLeaveToday).toHaveBeenCalledWith({
      requestContext,
    });
    expect(requestContext.values.ownerId).toBe(42);
    expect(result).toEqual(records);
  });

  it('returns an empty list when nobody is on leave today (empty-state section)', async () => {
    const mockRepo = {
      getEmployeesOnLeaveToday: vi.fn().mockResolvedValue([]),
    };

    const useCase = new GetEmployeesOnLeaveToday(mockRepo as never);
    const result = await useCase.execute({ requestContext });

    expect(result).toEqual([]);
  });
});
