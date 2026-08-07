import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestContext, AppError } from '@server/Application';
import { DeleteCertificate } from '../DeleteCertificate.usecase';
import type { CertificateRepository } from '../../../Domain/Certificate.respository';
import { Certificate } from '../../../Domain/Certificate.entity';
import { CertificateTypes } from '../../../Domain/CertificateTypes.entity';

vi.mock('@server/domains/Permissions', () => ({
  GetRoleByUser: class GetRoleByUser {},
}));

const certificateType = CertificateTypes.create({
  id: 1,
  name: 'Licencia',
});

const createCertificate = (
  overrides: Partial<Parameters<typeof Certificate.create>[0]> = {},
) =>
  Certificate.create({
    id: 1,
    startDate: new Date(2026, 0, 10),
    endDate: new Date(2026, 0, 20),
    returnDate: new Date(2026, 0, 25),
    reason: 'Test',
    type: certificateType,
    requiresRest: false,
    status: 'pendiente',
    userId: 5,
    ...overrides,
  });

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

const mockGetRoleByUser = { execute: vi.fn() };

const ownerContext = new RequestContext(5, 'req-owner', 10);
const adminContext = new RequestContext(99, 'req-admin', 10);
const otherUserContext = new RequestContext(7, 'req-other', 10);

describe('DeleteCertificate use case', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRoleByUser.execute.mockResolvedValue('');
  });

  // ── Owner soft-deletes own pendiente certificate (success) ──────────
  it('allows owner to soft-delete own pendiente certificate', async () => {
    const cert = createCertificate({ status: 'pendiente', userId: 5 });
    vi.mocked(mockRepository.getCertificate).mockResolvedValue(cert);
    vi.mocked(mockRepository.updateCertificateStatus).mockResolvedValue(cert);

    const useCase = new DeleteCertificate(
      mockRepository,
      mockGetRoleByUser as never,
    );

    await useCase.execute({
      input: { id: 1 },
      requestContext: ownerContext,
    });

    expect(mockRepository.updateCertificateStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        status: 'eliminado',
        requestContext: ownerContext,
      }),
    );
  });

  // ── Owner tries to delete already-eliminado certificate (blocked) ───
  it('throws when owner tries to delete an already eliminated certificate', async () => {
    const cert = createCertificate({ status: 'eliminado', userId: 5 });
    vi.mocked(mockRepository.getCertificate).mockResolvedValue(cert);

    const useCase = new DeleteCertificate(
      mockRepository,
      mockGetRoleByUser as never,
    );

    await expect(
      useCase.execute({
        input: { id: 1 },
        requestContext: ownerContext,
      }),
    ).rejects.toThrow(AppError);

    expect(mockRepository.updateCertificateStatus).not.toHaveBeenCalled();
  });

  // ── Owner tries to delete someone else's certificate (blocked) ──────
  it('throws when non-owner non-admin tries to delete another user certificate', async () => {
    const cert = createCertificate({ status: 'pendiente', userId: 5 });
    vi.mocked(mockRepository.getCertificate).mockResolvedValue(cert);

    const useCase = new DeleteCertificate(
      mockRepository,
      mockGetRoleByUser as never,
    );

    await expect(
      useCase.execute({
        input: { id: 1 },
        requestContext: otherUserContext,
      }),
    ).rejects.toThrow(AppError);

    expect(mockRepository.updateCertificateStatus).not.toHaveBeenCalled();
  });

  // ── Admin soft-deletes any-status certificate (success) ────────────
  it('allows admin to soft-delete any-status certificate in tenant', async () => {
    const cert = createCertificate({ status: 'rechazado', userId: 5 });
    vi.mocked(mockRepository.getCertificate).mockResolvedValue(cert);
    vi.mocked(mockRepository.updateCertificateStatus).mockResolvedValue(cert);
    mockGetRoleByUser.execute.mockResolvedValue('Full Admin');

    const useCase = new DeleteCertificate(
      mockRepository,
      mockGetRoleByUser as never,
    );

    await useCase.execute({
      input: { id: 1 },
      requestContext: adminContext,
    });

    expect(mockRepository.updateCertificateStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        status: 'eliminado',
        requestContext: adminContext,
      }),
    );
  });

  // ── Administrador role soft-deletes any-status certificate (success) ──
  it('allows Administrador role to soft-delete any-status certificate in tenant', async () => {
    const cert = createCertificate({ status: 'rechazado', userId: 5 });
    vi.mocked(mockRepository.getCertificate).mockResolvedValue(cert);
    vi.mocked(mockRepository.updateCertificateStatus).mockResolvedValue(cert);
    mockGetRoleByUser.execute.mockResolvedValue('Administrador');

    const useCase = new DeleteCertificate(
      mockRepository,
      mockGetRoleByUser as never,
    );

    await useCase.execute({
      input: { id: 1 },
      requestContext: adminContext,
    });

    expect(mockRepository.updateCertificateStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        status: 'eliminado',
        requestContext: adminContext,
      }),
    );
  });

  // ── Certificate not found ──────────────────────────────────────────
  it('throws when certificate is not found', async () => {
    vi.mocked(mockRepository.getCertificate).mockResolvedValue(null);

    const useCase = new DeleteCertificate(
      mockRepository,
      mockGetRoleByUser as never,
    );

    await expect(
      useCase.execute({
        input: { id: 999 },
        requestContext: ownerContext,
      }),
    ).rejects.toThrow(AppError);

    expect(mockRepository.updateCertificateStatus).not.toHaveBeenCalled();
  });
});
