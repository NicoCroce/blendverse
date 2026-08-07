import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { NotifyNewDocument } from '../NotifyNewDocument.usecase';

const requestContext = new RequestContext(1, 'req-1', 42);

const { newDocumentNotificationTemplate } = vi.hoisted(() => ({
  newDocumentNotificationTemplate: vi.fn(),
}));

vi.mock('@server/Infrastructure', () => ({
  emailTemplates: { newDocumentNotification: newDocumentNotificationTemplate },
  isValidEmail: (email: string | null | undefined): boolean => {
    if (!email) return false;
    const trimmed = email.trim();
    if (trimmed === '') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  },
}));

describe('NotifyNewDocument (US6/FR-013..FR-015 — notificación inmediata)', () => {
  beforeEach(() => vi.clearAllMocks());

  const input = {
    ownerId: 42,
    employeeId: 5,
    employeeName: 'Carlos Gómez',
    employeeEmail: 'carlos@test.com',
    companyName: 'Acme S.A.',
    documents: [
      { documentId: 1, documentTitle: 'Recibo de sueldo' },
      { documentId: 2, documentTitle: 'Reglamento interno' },
    ],
  };

  it('sends one email grouping all documents and returns { notified: true } (FR-013)', async () => {
    newDocumentNotificationTemplate.mockReturnValue({
      subject: '[GestDoc] Tienes nuevos documentos por revisar',
      body: '<h1>Hola Carlos Gómez</h1><p>Documentos nuevos (2)</p>',
    });
    const sender = { send: vi.fn().mockResolvedValue(undefined) };
    const useCase = new NotifyNewDocument(sender);

    const result = await useCase.execute({ input, requestContext });

    expect(result).toEqual({ notified: true });
    expect(sender.send).toHaveBeenCalledOnce();
    const params = sender.send.mock.calls[0][0];
    expect(params.to).toEqual(['carlos@test.com']);
    expect(params.subject).toBe(
      '[GestDoc] Tienes nuevos documentos por revisar',
    );
    expect(params.html).toContain('Documentos nuevos (2)');
    expect(newDocumentNotificationTemplate).toHaveBeenCalledWith(input);
  });

  it('omits the email when the employee email is invalid (FR-014)', async () => {
    const sender = { send: vi.fn() };
    const useCase = new NotifyNewDocument(sender);

    const result = await useCase.execute({
      input: { ...input, employeeEmail: 'sin-correo' },
      requestContext,
    });

    expect(result).toEqual({ notified: false });
    expect(sender.send).not.toHaveBeenCalled();
    expect(newDocumentNotificationTemplate).not.toHaveBeenCalled();
  });

  it('returns { notified: false } without rethrowing when the email fails (FR-015)', async () => {
    newDocumentNotificationTemplate.mockReturnValue({
      subject: 'subject',
      body: 'body',
    });
    const sender = {
      send: vi.fn().mockRejectedValue(new Error('SMTP down')),
    };
    const useCase = new NotifyNewDocument(sender);

    const result = await useCase.execute({ input, requestContext });

    expect(result).toEqual({ notified: false });
    expect(sender.send).toHaveBeenCalledOnce();
  });
});
