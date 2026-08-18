import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { SendEmailService } from '../SendEmail.service';

const { addLicense, applyWelcome, execute } = vi.hoisted(() => ({
  addLicense: vi
    .fn()
    .mockReturnValue({ subject: 'License', body: '<p>License</p>' }),
  applyWelcome: vi.fn((body: string) => `<p>Welcome</p><hr>${body}`),
  execute: vi.fn(),
}));

vi.mock('@server/Application/Adapters', () => ({ executeUseCase: execute }));
vi.mock('@server/Infrastructure', () => ({
  emailTemplates: { addLicense },
  applyInstitutionalWelcome: applyWelcome,
  getDateString: (date: Date) => date.toISOString().slice(0, 10),
  MailNotificationService: class MailNotificationService {},
}));
vi.mock('@server/Infrastructure/utils/pino', () => ({
  loggerContext: () => ({ error: vi.fn() }),
}));
vi.mock('@server/domains/Certificates', () => ({
  Certificate: class Certificate {},
}));
vi.mock('@server/domains/Users', () => ({ GetUser: class GetUser {} }));
vi.mock('@server/domains/Permissions/Application', () => ({
  GetAdmins: class GetAdmins {},
}));

const context = new RequestContext(7, 'send-email', 41);

describe('SendEmailService CompanyEmailSettings gates', () => {
  beforeEach(() => vi.clearAllMocks());

  it('resolves the admin policy before rendering and passes decoration metadata to the email port', async () => {
    execute
      .mockResolvedValueOnce({
        values: { name: 'Ana', surname: 'Admin', mail: 'ana@acme.test' },
      })
      .mockResolvedValueOnce({
        enabled: true,
        recipients: ['ops@acme.test'],
        welcomeMessage: 'Welcome',
      });
    const sender = { sendOne: vi.fn().mockResolvedValue(undefined) };
    const service = new SendEmailService(
      {} as never,
      sender as never,
      {} as never,
    );

    await service.addLincence({
      certificate: { values: { reason: 'Vacation' } } as never,
      requestContext: context,
    });

    expect(execute).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        input: { code: 'admin_license_created' },
        requestContext: context,
      }),
    );
    expect(addLicense).toHaveBeenCalledWith({
      reason: 'Vacation',
      currentUser: 'Ana Admin',
    });
    expect(applyWelcome).not.toHaveBeenCalled();
    expect(sender.sendOne).toHaveBeenCalledWith({
      to: ['ops@acme.test'],
      subject: 'License',
      html: '<p>License</p>',
      code: 'admin_license_created',
      welcomeMessage: 'Welcome',
    });
  });

  it('gates the manual requester route independently and never applies the welcome decorator', async () => {
    execute
      .mockResolvedValueOnce({
        values: { name: 'Ana', surname: 'Admin', mail: 'ana@acme.test' },
      })
      .mockResolvedValueOnce({
        enabled: true,
        recipients: ['ops@acme.test'],
        welcomeMessage: 'Welcome',
      });
    const sender = { sendOne: vi.fn().mockResolvedValue(undefined) };
    const service = new SendEmailService(
      {} as never,
      sender as never,
      {} as never,
    );

    await service.sendDocumentToEmail({
      documentId: 9,
      documentTitle: 'Manual.pdf',
      pdfBuffer: Buffer.from('pdf'),
      requestContext: context,
    });

    expect(execute).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        input: { code: 'requester_document_manual' },
        requestContext: context,
      }),
    );
    expect(applyWelcome).not.toHaveBeenCalled();
    expect(sender.sendOne).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'ana@acme.test',
        html: expect.stringContaining('Manual.pdf'),
        code: 'requester_document_manual',
        welcomeMessage: 'Welcome',
      }),
    );
  });
});
