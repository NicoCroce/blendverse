import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { NotifyNewDocument } from '../NotifyNewDocument.usecase';

const requestContext = new RequestContext(1, 'req-1', 42);

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
    const sender = { sendNewDocument: vi.fn().mockResolvedValue(undefined) };
    const policy = {
      execute: vi
        .fn()
        .mockResolvedValue({ enabled: true, welcomeMessage: 'Welcome' }),
    };
    const useCase = new NotifyNewDocument(sender as never, policy as never);

    const result = await useCase.execute({ input, requestContext });

    expect(result).toEqual({ notified: true });
    expect(sender.sendNewDocument).toHaveBeenCalledWith({
      to: ['carlos@test.com'],
      employeeName: input.employeeName,
      companyName: input.companyName,
      documents: input.documents,
      welcomeMessage: 'Welcome',
      requestContext,
    });
  });

  it('omits the email when the employee email is invalid (FR-014)', async () => {
    const sender = { sendNewDocument: vi.fn() };
    const policy = {
      execute: vi
        .fn()
        .mockResolvedValue({ enabled: true, welcomeMessage: null }),
    };
    const useCase = new NotifyNewDocument(sender as never, policy as never);

    const result = await useCase.execute({
      input: { ...input, employeeEmail: 'sin-correo' },
      requestContext,
    });

    expect(result).toEqual({ notified: false });
    expect(sender.sendNewDocument).not.toHaveBeenCalled();
  });

  it('returns { notified: false } without rethrowing when the email fails (FR-015)', async () => {
    const sender = {
      sendNewDocument: vi.fn().mockRejectedValue(new Error('SMTP down')),
    };
    const policy = {
      execute: vi
        .fn()
        .mockResolvedValue({ enabled: true, welcomeMessage: null }),
    };
    const useCase = new NotifyNewDocument(sender as never, policy as never);

    const result = await useCase.execute({ input, requestContext });

    expect(result).toEqual({ notified: false });
    expect(sender.sendNewDocument).toHaveBeenCalledOnce();
  });
});
