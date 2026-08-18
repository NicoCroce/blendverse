import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestContext, AppError } from '@server/Application';
import { AddCertificate } from '../AddCertificate.usecases';
import type { CertificateRepository } from '../../../Domain/Certificate.respository';

const mockRepository: CertificateRepository = {
  getCertificates: vi.fn(),
  getCertificatesTypes: vi.fn(),
  addCertificate: vi.fn(),
  appendImages: vi.fn(),
  getAllCompanyCertificates: vi.fn(),
  getStatisticsCertificates: vi.fn(),
  getMonthlyStatisticsCertificates: vi.fn(),
  deleteCertificate: vi.fn(),
  updateCertificateStatus: vi.fn(),
  getCertificate: vi.fn(),
  getEmployeesOnLeaveToday: vi.fn(),
  getPendingLicenses: vi.fn(),
  getUpcomingVacations: vi.fn(),
  getExpiringLicenses: vi.fn(),
  countLicensesInProgress: vi.fn(),
  countPendingLicenses: vi.fn(),
};

const requestContext = new RequestContext(1, 'req-test', 10);

describe('AddCertificate use case', () => {
  beforeEach(() => vi.clearAllMocks());

  it('passes returnDate and requiresRest to Certificate.create and delegates to repo', async () => {
    const expectedCert = { id: 1 };
    vi.mocked(mockRepository.addCertificate).mockResolvedValue(
      expectedCert as never,
    );

    const useCase = new AddCertificate(mockRepository);
    await useCase.execute({
      input: {
        type: 2,
        startDate: new Date(2026, 0, 10),
        endDate: new Date(2026, 0, 20),
        returnDate: new Date(2026, 0, 25),
        reason: 'Vacaciones',
        requiresRest: true,
      },
      requestContext,
    });

    expect(mockRepository.addCertificate).toHaveBeenCalledOnce();
    expect(mockRepository.addCertificate).toHaveBeenCalledWith(
      expect.objectContaining({
        certificate: expect.objectContaining({
          values: expect.objectContaining({
            returnDate: new Date(2026, 0, 25),
            requiresRest: true,
          }),
        }),
        requestContext,
      }),
    );
  });

  it('maps entity date-order Error to AppError with statusCode 400', async () => {
    const useCase = new AddCertificate(mockRepository);

    try {
      await useCase.execute({
        input: {
          type: 1,
          startDate: new Date(2026, 0, 20),
          endDate: new Date(2026, 0, 10),
          returnDate: new Date(2026, 0, 25),
          reason: 'Test',
          requiresRest: false,
        },
        requestContext,
      });
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).statusCode).toBe(400);
    }
  });

  it('maps overlap Error from repo to AppError with statusCode 400', async () => {
    vi.mocked(mockRepository.addCertificate).mockRejectedValue(
      new Error('Ya existe una licencia con fechas que se solapan'),
    );

    const useCase = new AddCertificate(mockRepository);

    try {
      await useCase.execute({
        input: {
          type: 1,
          startDate: new Date(2026, 0, 10),
          endDate: new Date(2026, 0, 20),
          returnDate: new Date(2026, 0, 25),
          reason: 'Test',
          requiresRest: false,
        },
        requestContext,
      });
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).statusCode).toBe(400);
    }
  });
});
