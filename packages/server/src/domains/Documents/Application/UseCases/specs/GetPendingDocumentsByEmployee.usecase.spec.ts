import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { GetPendingDocumentsByEmployee } from '../GetPendingDocumentsByEmployee.usecase';

const requestContext = new RequestContext(1, 'req-1', 42);

describe('GetPendingDocumentsByEmployee (pendientes de UN empleado)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delegates to the repository with employeeId and requestContext', async () => {
    const records = [
      {
        documentId: 10,
        documentTitle: 'Recibo de sueldo',
        isUnsigned: true,
        isUnviewed: false,
      },
      {
        documentId: 11,
        documentTitle: 'Reglamento interno',
        isUnsigned: false,
        isUnviewed: true,
      },
    ];
    const mockRepo = {
      getPendingDocumentsByEmployee: vi.fn().mockResolvedValue(records),
    };

    const useCase = new GetPendingDocumentsByEmployee(mockRepo as never);
    const result = await useCase.execute({
      input: { employeeId: 5 },
      requestContext,
    });

    expect(mockRepo.getPendingDocumentsByEmployee).toHaveBeenCalledOnce();
    expect(mockRepo.getPendingDocumentsByEmployee).toHaveBeenCalledWith({
      employeeId: 5,
      requestContext,
    });
    expect(result).toEqual(records);
  });

  it('propagates the ownerId from requestContext (multi-tenant, Pr. II)', async () => {
    const mockRepo = {
      getPendingDocumentsByEmployee: vi.fn().mockResolvedValue([]),
    };
    const contextWithOwnerId99 = new RequestContext(1, 'req-99', 99);

    const useCase = new GetPendingDocumentsByEmployee(mockRepo as never);
    await useCase.execute({
      input: { employeeId: 7 },
      requestContext: contextWithOwnerId99,
    });

    expect(mockRepo.getPendingDocumentsByEmployee).toHaveBeenCalledWith({
      employeeId: 7,
      requestContext: contextWithOwnerId99,
    });
    expect(
      mockRepo.getPendingDocumentsByEmployee.mock.calls[0][0].requestContext
        .values.ownerId,
    ).toBe(99);
  });

  it('returns an empty list when the employee has no pending documents', async () => {
    const mockRepo = {
      getPendingDocumentsByEmployee: vi.fn().mockResolvedValue([]),
    };

    const useCase = new GetPendingDocumentsByEmployee(mockRepo as never);
    const result = await useCase.execute({
      input: { employeeId: 5 },
      requestContext,
    });

    expect(result).toEqual([]);
  });
});
