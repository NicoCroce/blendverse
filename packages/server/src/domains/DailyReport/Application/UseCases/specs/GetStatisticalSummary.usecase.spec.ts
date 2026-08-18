import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { GetStatisticalSummary } from '../GetStatisticalSummary.usecase';

const requestContext = new RequestContext(1, 'req-1', 42);

describe('GetStatisticalSummary (US8 — resumen estadístico)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('assembles the 5 totals from the count use cases propagating the ownerId', async () => {
    const mockCounts = {
      activeEmployees: { execute: vi.fn().mockResolvedValue(50) },
      licensesInProgress: { execute: vi.fn().mockResolvedValue(3) },
      pendingLicenses: { execute: vi.fn().mockResolvedValue(5) },
      unsignedDocuments: { execute: vi.fn().mockResolvedValue(10) },
      pendingDisclaimers: { execute: vi.fn().mockResolvedValue(8) },
    };

    const useCase = new GetStatisticalSummary(
      mockCounts.activeEmployees as never,
      mockCounts.licensesInProgress as never,
      mockCounts.pendingLicenses as never,
      mockCounts.unsignedDocuments as never,
      mockCounts.pendingDisclaimers as never,
    );

    const result = await useCase.execute({ requestContext });

    expect(result.section).toEqual({
      activeEmployees: 50,
      licensesInProgress: 3,
      pendingLicenses: 5,
      unsignedDocuments: 10,
      pendingDisclaimerAcceptances: 8,
    });

    // Multi-tenant: todos los counts reciben el requestContext con el ownerId
    for (const mock of Object.values(mockCounts)) {
      expect(mock.execute).toHaveBeenCalledWith(
        expect.objectContaining({ requestContext }),
      );
    }
  });

  it('returns zeros when every count is zero (empty company)', async () => {
    const zeroCount = vi.fn().mockResolvedValue(0);
    const mockCounts = {
      activeEmployees: { execute: zeroCount },
      licensesInProgress: { execute: zeroCount },
      pendingLicenses: { execute: zeroCount },
      unsignedDocuments: { execute: zeroCount },
      pendingDisclaimers: { execute: zeroCount },
    };

    const useCase = new GetStatisticalSummary(
      mockCounts.activeEmployees as never,
      mockCounts.licensesInProgress as never,
      mockCounts.pendingLicenses as never,
      mockCounts.unsignedDocuments as never,
      mockCounts.pendingDisclaimers as never,
    );

    const result = await useCase.execute({ requestContext });

    expect(result.section).toEqual({
      activeEmployees: 0,
      licensesInProgress: 0,
      pendingLicenses: 0,
      unsignedDocuments: 0,
      pendingDisclaimerAcceptances: 0,
    });
  });
});
