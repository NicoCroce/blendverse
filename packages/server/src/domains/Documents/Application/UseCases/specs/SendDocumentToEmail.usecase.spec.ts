import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestContext, AppError } from '@server/Application';
import { SendDocumentToEmail } from '../SendDocumentToEmail.usecase';
import type { DocumentRepository } from '../../../Domain/Document.repository';
import { Document } from '../../../Domain/Document.entity';

const createDoc = (
  overrides: Partial<{ signed: Date | null; agreedment: boolean | null }> = {},
) =>
  Document.create({
    id: 1,
    uploadDate: new Date(),
    title: 'Test Doc',
    file: 'https://example.com/doc.pdf',
    signed: null,
    reasonSignatureNonConformity: null,
    view: null,
    type: 'recibo',
    requireSign: true,
    validationSign: null,
    agreedment: null,
    ...overrides,
  });

const mockRepository: DocumentRepository = {
  getDocuments: vi.fn(),
  getDocument: vi.fn(),
  viewDocument: vi.fn(),
  signDocument: vi.fn(),
  getDocumentsByCompany: vi.fn(),
  getStatisticsDocuments: vi.fn(),
};

const requestContext = new RequestContext(1, 'req-test', 10);

describe('SendDocumentToEmail use case', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the document when canDownload is true', async () => {
    const doc = createDoc({ signed: new Date(), agreedment: true });
    vi.mocked(mockRepository.getDocument).mockResolvedValue(doc);

    const useCase = new SendDocumentToEmail(mockRepository);
    const result = await useCase.execute({
      input: { documentId: 1 },
      requestContext,
    });

    expect(result).toBe(doc);
    expect(mockRepository.getDocument).toHaveBeenCalledWith({
      id: 1,
      requestContext,
    });
  });

  it('throws AppError when document not found', async () => {
    vi.mocked(mockRepository.getDocument).mockResolvedValue(null);

    const useCase = new SendDocumentToEmail(mockRepository);

    await expect(
      useCase.execute({
        input: { documentId: 999 },
        requestContext,
      }),
    ).rejects.toThrow(AppError);

    await expect(
      useCase.execute({
        input: { documentId: 999 },
        requestContext,
      }),
    ).rejects.toThrow('Documento no encontrado');
  });

  it('throws AppError when canDownload is false (unsigned document)', async () => {
    const doc = createDoc({ signed: null, agreedment: null });
    vi.mocked(mockRepository.getDocument).mockResolvedValue(doc);

    const useCase = new SendDocumentToEmail(mockRepository);

    await expect(
      useCase.execute({
        input: { documentId: 1 },
        requestContext,
      }),
    ).rejects.toThrow(AppError);

    await expect(
      useCase.execute({
        input: { documentId: 1 },
        requestContext,
      }),
    ).rejects.toThrow('El documento no está disponible para descarga');
  });

  it('throws AppError when canDownload is false (signed without conformity)', async () => {
    const doc = createDoc({ signed: new Date(), agreedment: false });
    vi.mocked(mockRepository.getDocument).mockResolvedValue(doc);

    const useCase = new SendDocumentToEmail(mockRepository);

    await expect(
      useCase.execute({
        input: { documentId: 1 },
        requestContext,
      }),
    ).rejects.toThrow(AppError);
  });
});
