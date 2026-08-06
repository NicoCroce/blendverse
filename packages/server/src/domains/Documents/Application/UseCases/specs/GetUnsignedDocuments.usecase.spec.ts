import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { GetUnsignedDocuments } from '../GetUnsignedDocuments.usecase';

const requestContext = new RequestContext(1, 'req-1', 42);

describe('GetUnsignedDocuments (US4 — documentos sin firmar)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delegates to the repository with the requestContext and returns unsigned documents with viewStatus', async () => {
    const records = [
      {
        documentId: 10,
        documentTitle: 'Recibo de sueldo',
        employeeId: 3,
        employeeName: 'Carlos Gómez',
        viewStatus: 'No visto' as const,
      },
      {
        documentId: 11,
        documentTitle: 'Reglamento interno',
        employeeId: 4,
        employeeName: 'Ana Ruiz',
        viewStatus: 'Visto' as const,
      },
    ];
    const mockRepo = {
      getUnsignedDocuments: vi.fn().mockResolvedValue(records),
    };

    const useCase = new GetUnsignedDocuments(mockRepo as never);
    const result = await useCase.execute({ requestContext });

    expect(mockRepo.getUnsignedDocuments).toHaveBeenCalledWith({
      requestContext,
    });
    expect(requestContext.values.ownerId).toBe(42);
    // El estado de visualización (viewStatus) viaja en cada registro (US4)
    expect(result[0].viewStatus).toBe('No visto');
    expect(result[1].viewStatus).toBe('Visto');
    expect(result).toEqual(records);
  });

  it('returns an empty list when all documents are signed', async () => {
    const mockRepo = {
      getUnsignedDocuments: vi.fn().mockResolvedValue([]),
    };

    const useCase = new GetUnsignedDocuments(mockRepo as never);
    const result = await useCase.execute({ requestContext });

    expect(result).toEqual([]);
  });
});
