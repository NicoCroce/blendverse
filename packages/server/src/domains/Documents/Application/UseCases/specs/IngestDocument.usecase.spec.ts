import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { User } from '@server/domains/Users/Domain/User.entity';
import { IngestDocument } from '../IngestDocument.usecase';

const requestContext = new RequestContext(1, 'req-1', 42);

const buildUser = (overrides: Partial<{ id: number; surname: string }> = {}) =>
  User.create({
    id: 5,
    mail: 'carlos@test.com',
    name: 'Carlos',
    surname: 'Gómez',
    ownerId: 42,
    ...overrides,
  });

const createdRecords = [
  { id: 10, employeeId: 5, titulo: 'Recibo de sueldo' },
  { id: 11, employeeId: 5, titulo: 'Reglamento interno' },
  { id: 12, titulo: 'Documento sin destinatario' },
];

const buildMocks = () => ({
  repository: {
    createDocuments: vi.fn().mockResolvedValue(createdRecords),
  },
  getUser: {
    execute: vi.fn().mockResolvedValue(buildUser()),
  },
  getAllActiveOwners: {
    execute: vi.fn().mockResolvedValue([{ id: 42, denominacion: 'Acme S.A.' }]),
  },
  notifyNewDocument: {
    execute: vi.fn().mockResolvedValue({ notified: true }),
  },
});

describe('IngestDocument (US6/FR-011..FR-016 — ingreso + notificación real-time)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('persists documents with the tenant ownerId and notifies the assigned employee (FR-013)', async () => {
    const mocks = buildMocks();
    const useCase = new IngestDocument(
      mocks.repository as never,
      mocks.getUser as never,
      mocks.getAllActiveOwners as never,
      mocks.notifyNewDocument as never,
    );

    const result = await useCase.execute({
      input: {
        documents: [
          {
            employeeId: 5,
            tipo: 1,
            titulo: 'Recibo de sueldo',
            archivo: 'recibo.pdf',
          },
        ],
      },
      requestContext,
    });

    // Multi-tenant: ownerId del requestContext viaja al repositorio
    expect(mocks.repository.createDocuments).toHaveBeenCalledWith(
      expect.objectContaining({ requestContext }),
    );
    expect(
      mocks.repository.createDocuments.mock.calls[0][0].requestContext.values
        .ownerId,
    ).toBe(42);

    // 1 email por empleado agrupando TODOS los documentos de la operación
    expect(mocks.notifyNewDocument.execute).toHaveBeenCalledTimes(1);
    const notifyCall = mocks.notifyNewDocument.execute.mock.calls[0][0];
    expect(notifyCall.input).toEqual({
      ownerId: 42,
      employeeId: 5,
      employeeName: 'Carlos Gómez',
      employeeEmail: 'carlos@test.com',
      companyName: 'Acme S.A.',
      documents: [
        { documentId: 10, documentTitle: 'Recibo de sueldo' },
        { documentId: 11, documentTitle: 'Reglamento interno' },
      ],
    });

    expect(result).toEqual({
      documentIds: [10, 11, 12],
      notified: true,
    });
  });

  it('skips employees without a destination (employeeId undefined) from notification (FR-014)', async () => {
    const mocks = buildMocks();
    mocks.repository.createDocuments.mockResolvedValue([
      { id: 12, titulo: 'Documento sin destinatario' },
    ]);

    const useCase = new IngestDocument(
      mocks.repository as never,
      mocks.getUser as never,
      mocks.getAllActiveOwners as never,
      mocks.notifyNewDocument as never,
    );

    const result = await useCase.execute({
      input: {
        documents: [{ tipo: 1, titulo: 'Sin dueño', archivo: 'a.pdf' }],
      },
      requestContext,
    });

    expect(mocks.notifyNewDocument.execute).not.toHaveBeenCalled();
    expect(result).toEqual({ documentIds: [12], notified: false });
  });

  it('continues with other employees when a notification fails for one (FR-015)', async () => {
    const mocks = buildMocks();
    mocks.repository.createDocuments.mockResolvedValue([
      { id: 10, employeeId: 5, titulo: 'Doc A' },
      { id: 11, employeeId: 6, titulo: 'Doc B' },
    ]);
    mocks.getUser.execute
      .mockResolvedValueOnce(buildUser({ id: 5 }))
      .mockRejectedValueOnce(new Error('user resolution failed'));
    mocks.notifyNewDocument.execute.mockResolvedValue({ notified: true });

    const useCase = new IngestDocument(
      mocks.repository as never,
      mocks.getUser as never,
      mocks.getAllActiveOwners as never,
      mocks.notifyNewDocument as never,
    );

    const result = await useCase.execute({
      input: {
        documents: [
          { employeeId: 5, tipo: 1, titulo: 'Doc A', archivo: 'a.pdf' },
          { employeeId: 6, tipo: 1, titulo: 'Doc B', archivo: 'b.pdf' },
        ],
      },
      requestContext,
    });

    // El fallo de resolución del empleado 6 NO bloquea el ingreso
    expect(mocks.repository.createDocuments).toHaveBeenCalledOnce();
    expect(result).toEqual({ documentIds: [10, 11], notified: true });
  });

  it('reports notified=false when the email sender fails for the only employee (FR-015)', async () => {
    const mocks = buildMocks();
    mocks.repository.createDocuments.mockResolvedValue([
      { id: 10, employeeId: 5, titulo: 'Doc A' },
    ]);
    mocks.notifyNewDocument.execute.mockResolvedValue({ notified: false });

    const useCase = new IngestDocument(
      mocks.repository as never,
      mocks.getUser as never,
      mocks.getAllActiveOwners as never,
      mocks.notifyNewDocument as never,
    );

    const result = await useCase.execute({
      input: {
        documents: [
          { employeeId: 5, tipo: 1, titulo: 'Doc A', archivo: 'a.pdf' },
        ],
      },
      requestContext,
    });

    expect(result).toEqual({ documentIds: [10], notified: false });
  });

  it('propagates errors from the repository persistence (ingest fails)', async () => {
    const mocks = buildMocks();
    mocks.repository.createDocuments.mockRejectedValue(
      new Error('DB constraint failed'),
    );

    const useCase = new IngestDocument(
      mocks.repository as never,
      mocks.getUser as never,
      mocks.getAllActiveOwners as never,
      mocks.notifyNewDocument as never,
    );

    await expect(
      useCase.execute({
        input: {
          documents: [
            { employeeId: 5, tipo: 1, titulo: 'Doc', archivo: 'a.pdf' },
          ],
        },
        requestContext,
      }),
    ).rejects.toThrow('DB constraint failed');
    expect(mocks.notifyNewDocument.execute).not.toHaveBeenCalled();
  });
});
