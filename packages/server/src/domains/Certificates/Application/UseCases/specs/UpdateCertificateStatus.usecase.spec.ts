import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestContext, AppError } from '@server/Application';
import { UpdateCertificateStatus } from '../UpdateCertificateStatus.usecase';
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
    status: 'aprobado',
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

const adminContext = new RequestContext(99, 'req-admin', 10);
const nonAdminContext = new RequestContext(5, 'req-user', 10);

describe('UpdateCertificateStatus use case', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Admin changes status (success) ─────────────────────────────────────
  it('allows admin to change certificate status', async () => {
    const cert = createCertificate({ status: 'validando' });
    const updatedCert = createCertificate({ status: 'aprobado' });
    vi.mocked(mockRepository.getCertificate).mockResolvedValue(cert);
    vi.mocked(mockRepository.updateCertificateStatus).mockResolvedValue(
      updatedCert,
    );
    mockGetRoleByUser.execute.mockResolvedValue('Full Admin');

    const useCase = new UpdateCertificateStatus(
      mockRepository,
      mockGetRoleByUser as never,
    );

    const result = await useCase.execute({
      input: { id: 1, status: 'aprobado' },
      requestContext: adminContext,
    });

    expect(mockRepository.updateCertificateStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        status: 'aprobado',
        requestContext: adminContext,
      }),
    );
    expect(result.values.status).toBe('aprobado');
  });

  // ── Administrador role can change status (success) ────────────────────
  it('allows Administrador role to change certificate status', async () => {
    const cert = createCertificate({ status: 'validando' });
    const updatedCert = createCertificate({ status: 'aprobado' });
    vi.mocked(mockRepository.getCertificate).mockResolvedValue(cert);
    vi.mocked(mockRepository.updateCertificateStatus).mockResolvedValue(
      updatedCert,
    );
    mockGetRoleByUser.execute.mockResolvedValue('Administrador');

    const useCase = new UpdateCertificateStatus(
      mockRepository,
      mockGetRoleByUser as never,
    );

    const result = await useCase.execute({
      input: { id: 1, status: 'aprobado' },
      requestContext: adminContext,
    });

    expect(mockRepository.updateCertificateStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        status: 'aprobado',
        requestContext: adminContext,
      }),
    );
    expect(result.values.status).toBe('aprobado');
  });

  // ── Non-admin tries status change (blocked) ────────────────────────────
  it('throws when non-admin tries to change status', async () => {
    const cert = createCertificate({ status: 'aprobado' });
    vi.mocked(mockRepository.getCertificate).mockResolvedValue(cert);
    mockGetRoleByUser.execute.mockResolvedValue('');

    const useCase = new UpdateCertificateStatus(
      mockRepository,
      mockGetRoleByUser as never,
    );

    await expect(
      useCase.execute({
        input: { id: 1, status: 'aprobado' },
        requestContext: nonAdminContext,
      }),
    ).rejects.toThrow(AppError);

    expect(mockRepository.updateCertificateStatus).not.toHaveBeenCalled();
  });

  // ── Certificate not found ──────────────────────────────────────────────
  it('throws when certificate is not found', async () => {
    vi.mocked(mockRepository.getCertificate).mockResolvedValue(null);
    mockGetRoleByUser.execute.mockResolvedValue('Full Admin');

    const useCase = new UpdateCertificateStatus(
      mockRepository,
      mockGetRoleByUser as never,
    );

    await expect(
      useCase.execute({
        input: { id: 999, status: 'aprobado' },
        requestContext: adminContext,
      }),
    ).rejects.toThrow(AppError);

    expect(mockRepository.updateCertificateStatus).not.toHaveBeenCalled();
  });

  // ── Cannot change status of eliminated certificate ─────────────────────
  it('throws when trying to change status of an eliminated certificate', async () => {
    const cert = createCertificate({ status: 'eliminado' });
    vi.mocked(mockRepository.getCertificate).mockResolvedValue(cert);
    mockGetRoleByUser.execute.mockResolvedValue('Full Admin');

    const useCase = new UpdateCertificateStatus(
      mockRepository,
      mockGetRoleByUser as never,
    );

    await expect(
      useCase.execute({
        input: { id: 1, status: 'aprobado' },
        requestContext: adminContext,
      }),
    ).rejects.toThrow(AppError);

    expect(mockRepository.updateCertificateStatus).not.toHaveBeenCalled();
  });

  // ── Admin can change to any valid status ───────────────────────────────
  it('allows admin to change status to rechazado', async () => {
    const cert = createCertificate({ status: 'validando' });
    const updatedCert = createCertificate({ status: 'rechazado' });
    vi.mocked(mockRepository.getCertificate).mockResolvedValue(cert);
    vi.mocked(mockRepository.updateCertificateStatus).mockResolvedValue(
      updatedCert,
    );
    mockGetRoleByUser.execute.mockResolvedValue('Full Admin');

    const useCase = new UpdateCertificateStatus(
      mockRepository,
      mockGetRoleByUser as never,
    );

    const result = await useCase.execute({
      input: { id: 1, status: 'rechazado' },
      requestContext: adminContext,
    });

    expect(result.values.status).toBe('rechazado');
  });
});
