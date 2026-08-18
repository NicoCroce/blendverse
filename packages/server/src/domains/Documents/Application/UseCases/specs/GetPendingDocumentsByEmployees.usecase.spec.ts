import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { GetPendingDocumentsByEmployees } from '../GetPendingDocumentsByEmployees.usecase';

const requestContext = new RequestContext(1, 'req-1', 42);

describe('GetPendingDocumentsByEmployees (pendientes batch de varios empleados)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delegates to the repository with employeeIds and requestContext', async () => {
    const records = [
      {
        employeeId: 5,
        documentId: 10,
        documentTitle: 'Recibo de sueldo',
        isUnsigned: true,
        isUnviewed: false,
      },
      {
        employeeId: 6,
        documentId: 20,
        documentTitle: 'Reglamento interno',
        isUnsigned: false,
        isUnviewed: true,
      },
    ];
    const mockRepo = {
      getPendingDocumentsByEmployees: vi.fn().mockResolvedValue(records),
    };

    const useCase = new GetPendingDocumentsByEmployees(mockRepo as never);
    const result = await useCase.execute({
      input: { employeeIds: [5, 6] },
      requestContext,
    });

    expect(mockRepo.getPendingDocumentsByEmployees).toHaveBeenCalledOnce();
    expect(mockRepo.getPendingDocumentsByEmployees).toHaveBeenCalledWith({
      employeeIds: [5, 6],
      requestContext,
    });
    expect(result).toEqual(records);
  });

  it('propagates the ownerId from requestContext (multi-tenant, Pr. II)', async () => {
    const mockRepo = {
      getPendingDocumentsByEmployees: vi.fn().mockResolvedValue([]),
    };
    const contextWithOwnerId99 = new RequestContext(1, 'req-99', 99);

    const useCase = new GetPendingDocumentsByEmployees(mockRepo as never);
    await useCase.execute({
      input: { employeeIds: [7, 8] },
      requestContext: contextWithOwnerId99,
    });

    expect(mockRepo.getPendingDocumentsByEmployees).toHaveBeenCalledWith({
      employeeIds: [7, 8],
      requestContext: contextWithOwnerId99,
    });
    expect(
      mockRepo.getPendingDocumentsByEmployees.mock.calls[0][0].requestContext
        .values.ownerId,
    ).toBe(99);
  });

  it('returns an empty list when the employeeIds array is empty', async () => {
    const mockRepo = {
      getPendingDocumentsByEmployees: vi.fn().mockResolvedValue([]),
    };

    const useCase = new GetPendingDocumentsByEmployees(mockRepo as never);
    const result = await useCase.execute({
      input: { employeeIds: [] },
      requestContext,
    });

    expect(mockRepo.getPendingDocumentsByEmployees).toHaveBeenCalledWith({
      employeeIds: [],
      requestContext,
    });
    expect(result).toEqual([]);
  });
});
