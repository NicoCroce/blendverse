import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Op } from 'sequelize';
import { RequestContext } from '@server/Application';
import type { IDocumentToCreate } from '@server/domains/Documents/Domain';
import { UserModel } from '@server/domains/Users';
import { logger } from '@server/Infrastructure/utils/pino';
import { Documentos } from '../index';
import { DocumentsRepositoryImplementation } from '../DocumentsRepository.implementation';

// El barrel Database/ (index.ts) arrastra Relations → UserModel/DocumentsTypesModel
// (asociaciones Sequelize sin instancia en tests). Se mockean los modelos a nivel
// de módulo para testear SOLO la orquestación multi-tenant de `createDocuments`
// con datos concretos, sin requerir una instancia Sequelize real.
vi.mock('../index', () => ({
  Documentos: { bulkCreate: vi.fn() },
}));

vi.mock('@server/domains/Users', () => ({
  UserModel: { findAll: vi.fn() },
}));

vi.mock('@server/domains/DocumentsTypes/Infrastructure', () => ({
  DocumentsTypesModel: {},
}));

vi.mock(
  '@server/domains/Segments/Infrastructure/Database/UsuariosSegmentos.model',
  () => ({
    UsuariosSegmentosModel: {},
  }),
);

vi.mock('@server/Infrastructure', () => ({
  buildEmployeeName: () => '',
}));

vi.mock('@server/Infrastructure/Database', () => ({
  TenantAwareRepository: class {},
}));

vi.mock('@server/Infrastructure/utils/pino', () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

const requestContext = new RequestContext(1, 'req-1', 42);

const ownTenantDocument: IDocumentToCreate = {
  employeeId: 5, // pertenece al tenant 42
  tipo: 1,
  titulo: 'Recibo de sueldo',
  archivo: 'recibo.pdf',
};

const foreignTenantDocument: IDocumentToCreate = {
  employeeId: 6, // pertenece a OTRO tenant
  tipo: 2,
  titulo: 'Reglamento interno',
  archivo: 'reglamento.pdf',
};

const documentWithoutEmployee: IDocumentToCreate = {
  tipo: 3,
  titulo: 'Sin destinatario',
  archivo: 'sindestino.pdf',
};

describe('DocumentsRepositoryImplementation.createDocuments (multi-tenant IDOR write / OWASP A01)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('persists only documents for employees belonging to the tenant ownerId', async () => {
    vi.mocked(UserModel.findAll).mockResolvedValue([{ id: 5 }] as never);
    vi.mocked(Documentos.bulkCreate).mockResolvedValue([
      { id: 100, Usuario_id: 5, titulo: 'Recibo de sueldo' },
    ] as never);

    const repository = new DocumentsRepositoryImplementation();
    const result = await repository.createDocuments({
      documents: [ownTenantDocument, foreignTenantDocument],
      requestContext,
    });

    // Filtro de pertenencia: solo empleados con id_propietario = ownerId
    expect(UserModel.findAll).toHaveBeenCalledWith({
      where: { id: { [Op.in]: [5, 6] }, id_propietario: 42 },
      attributes: ['id'],
    });

    // Solo se persiste el documento del empleado 5 (tenant propio)
    expect(Documentos.bulkCreate).toHaveBeenCalledTimes(1);
    expect(Documentos.bulkCreate).toHaveBeenCalledWith(
      [
        {
          Usuario_id: 5,
          tipo: 1,
          titulo: 'Recibo de sueldo',
          archivo: 'recibo.pdf',
          extension: null,
          fecha_de_subida: expect.any(Date),
        },
      ],
      { returning: true },
    );

    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId: 42, skipped: 1 }),
      expect.stringContaining('otro tenant'),
    );

    expect(result).toEqual([
      { id: 100, employeeId: 5, titulo: 'Recibo de sueldo' },
    ]);
  });

  it('returns [] and never calls bulkCreate when every employee belongs to another tenant (IDOR blocked)', async () => {
    vi.mocked(UserModel.findAll).mockResolvedValue([] as never);

    const repository = new DocumentsRepositoryImplementation();
    const result = await repository.createDocuments({
      documents: [foreignTenantDocument],
      requestContext,
    });

    expect(Documentos.bulkCreate).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('omits items without employeeId before the tenant check (Usuario_id NOT NULL, FR-014)', async () => {
    vi.mocked(UserModel.findAll).mockResolvedValue([{ id: 5 }] as never);
    vi.mocked(Documentos.bulkCreate).mockResolvedValue([
      { id: 101, Usuario_id: 5, titulo: 'Recibo de sueldo' },
    ] as never);

    const repository = new DocumentsRepositoryImplementation();
    const result = await repository.createDocuments({
      documents: [documentWithoutEmployee, ownTenantDocument],
      requestContext,
    });

    // El ítem sin employeeId NO entra al filtro de pertenencia
    expect(UserModel.findAll).toHaveBeenCalledWith({
      where: { id: { [Op.in]: [5] }, id_propietario: 42 },
      attributes: ['id'],
    });

    expect(Documentos.bulkCreate).toHaveBeenCalledTimes(1);
    const persisted = vi.mocked(Documentos.bulkCreate).mock.calls[0][0];
    expect(persisted).toHaveLength(1);
    expect(persisted[0].Usuario_id).toBe(5);

    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId: 42, skipped: 1 }),
      expect.stringContaining('sin empleado destinatario'),
    );

    expect(result).toEqual([
      { id: 101, employeeId: 5, titulo: 'Recibo de sueldo' },
    ]);
  });

  it('uses the requestContext ownerId as the tenant filter (not a hardcoded value)', async () => {
    const owner99Context = new RequestContext(1, 'req-2', 99);
    vi.mocked(UserModel.findAll).mockResolvedValue([] as never);

    const repository = new DocumentsRepositoryImplementation();
    const result = await repository.createDocuments({
      documents: [ownTenantDocument],
      requestContext: owner99Context,
    });

    expect(UserModel.findAll).toHaveBeenCalledWith({
      where: { id: { [Op.in]: [5] }, id_propietario: 99 },
      attributes: ['id'],
    });
    expect(Documentos.bulkCreate).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
