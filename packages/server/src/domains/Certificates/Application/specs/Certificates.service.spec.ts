import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  RequestContext,
  executeUseCase,
  parseDateOnly,
} from '@server/Application';
import { CertificatesServices } from '../Certificates.service';

vi.mock('@server/Application', async () => {
  const actual = await vi.importActual<typeof import('@server/Application')>(
    '@server/Application',
  );
  return { ...actual, executeUseCase: vi.fn() };
});

vi.mock('@server/Infrastructure', () => ({
  uploadImages: vi.fn(),
}));

vi.mock('@server/Application/Services/SendEmail.service', () => ({
  SendEmailService: class {
    addLincence() {}
  },
}));

const requestContext = new RequestContext(1, 'req-test', 10);

const buildService = () =>
  new CertificatesServices(
    {} as never, // getCertificates
    {} as never, // getCertificateTypes
    {} as never, // addCertificate
    {} as never, // appendImages
    {} as never, // getCertificatesByCompany
    {} as never, // getStatistisCertificates
    {} as never, // getMonthlyStatistisCertificates
    { addLincence: vi.fn() } as never, // sendEmailService
    {} as never, // deleteCertificate
    {} as never, // updateCertificateStatus
  );

describe('CertificatesServices', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('addCertificate()', () => {
    it('normalizes returnDate with parseDateOnly and delegates to executeUseCase', async () => {
      const mockCertificate = {
        values: {
          id: 1,
          startDate: new Date(),
          endDate: new Date(),
          returnDate: new Date(),
          reason: 'test',
          type: { values: { name: 'Anual' } },
          files: undefined,
          requiresRest: false,
        },
      };
      vi.mocked(executeUseCase).mockResolvedValue(mockCertificate as never);

      const service = buildService();
      await service.addCertificate({
        input: {
          startDate: '2026-01-10',
          endDate: '2026-01-20',
          returnDate: '2026-01-25',
          type: 2,
          reason: 'Vacaciones',
          requiresRest: false,
        },
        requestContext,
      });

      expect(executeUseCase).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            returnDate: parseDateOnly('2026-01-25'),
            requiresRest: false,
          }),
          requestContext,
        }),
      );
    });

    it('propagates errors as AppError', async () => {
      vi.mocked(executeUseCase).mockRejectedValue(new Error('Overlap'));

      const service = buildService();

      await expect(
        service.addCertificate({
          input: {
            startDate: '2026-01-10',
            endDate: '2026-01-20',
            returnDate: '2026-01-25',
            type: 1,
            reason: 'Test',
            requiresRest: false,
          },
          requestContext,
        }),
      ).rejects.toThrow();
    });
  });
});
