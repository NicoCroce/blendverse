import { executeUseCase, IUseCase } from '@server/Application';
import { GetAllActiveOwners, GetUser } from '@server/domains/Users/Application';
import { NotifyNewDocument } from '@server/domains/EmployeeReminders/Application';
import { logger } from '@server/Infrastructure/utils/pino';
import { DocumentRepository } from '../../Domain';
import { IIngestDocument, IIngestDocumentOutput } from '../documents.types';

/**
 * Punto de ingreso canónico de documentos (US6 / FR-011..FR-016).
 * Persiste los documentos con `fecha_de_subida = now` y `Usuario_id` y, para
 * cada empleado destinatario, dispara la notificación inmediata
 * (`_notifyNewDocument`, dominio dueño EmployeeReminders). Un fallo de
 * notificación o de resolución del empleado NUNCA bloquea el ingreso (FR-015):
 * el documento queda pendiente y lo cubre el batch diario.
 */
export class IngestDocument implements IUseCase<IIngestDocumentOutput> {
  constructor(
    private readonly documentsRepository: DocumentRepository,
    private readonly _getUser: GetUser,
    private readonly _getAllActiveOwners: GetAllActiveOwners,
    private readonly _notifyNewDocument: NotifyNewDocument,
  ) {}

  async execute({
    input,
    requestContext,
  }: IIngestDocument): Promise<IIngestDocumentOutput> {
    const ownerId = requestContext.values.ownerId;

    // 1. Persistencia (los ítems sin employeeId se omiten en el repositorio)
    const created = await this.documentsRepository.createDocuments({
      documents: input.documents,
      requestContext,
    });

    // 2. Agrupar los documentos persistidos por empleado destinatario (FR-013)
    const documentsByEmployee = new Map<
      number,
      Array<{ documentId: number; documentTitle: string }>
    >();

    for (const record of created) {
      if (record.employeeId === undefined || record.employeeId === null) {
        continue;
      }
      const group = documentsByEmployee.get(record.employeeId) ?? [];
      group.push({ documentId: record.id, documentTitle: record.titulo });
      documentsByEmployee.set(record.employeeId, group);
    }

    // 3. Resolver companyName (una sola llamada por operación)
    const owners = await executeUseCase({
      useCase: this._getAllActiveOwners,
      requestContext,
    });
    const companyName =
      owners.find((owner) => owner.id === ownerId)?.denominacion ?? '';

    // 4. Notificar por empleado; un fallo no bloquea el ingreso (FR-015)
    let notified = false;

    for (const [employeeId, documents] of documentsByEmployee) {
      try {
        const user = await executeUseCase({
          useCase: this._getUser,
          input: employeeId,
          requestContext,
        });

        const { notified: notifiedOne } = await executeUseCase({
          useCase: this._notifyNewDocument,
          input: {
            ownerId,
            employeeId,
            employeeName: `${user.values.name} ${
              user.values.surname ?? ''
            }`.trim(),
            employeeEmail: user.values.mail,
            companyName,
            documents,
          },
          requestContext,
        });

        if (notifiedOne) {
          notified = true;
        }
      } catch (error) {
        logger.error(
          { error, ownerId, employeeId },
          'New document notification skipped (ingest continues)',
        );
      }
    }

    return {
      documentIds: created.map((record) => record.id),
      notified,
    };
  }
}
