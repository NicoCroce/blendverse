import { describe, expect, it, vi } from 'vitest';
import { RequestContext } from '@server/Application';
import { SendEmployeeReminderEmail } from '../SendEmployeeReminderEmail.usecase';
import { NotifyNewDocument } from '../NotifyNewDocument.usecase';
import type { IEmployeeReminder } from '../../../Domain/EmployeeReminder.entity';

const context = new RequestContext(7, 'employee-mail', 41);
const reminder: IEmployeeReminder = {
  ownerId: 41,
  employeeId: 8,
  employeeName: 'Ana',
  employeeEmail: 'ana@acme.test',
  companyName: 'Acme',
  date: '2026-08-17',
  pending: {
    unsignedDocuments: [{ documentId: 1, documentTitle: 'Policy' }],
    unviewedDocuments: [],
    pendingDisclaimerAcceptance: false,
    renewPassword: false,
  },
  shouldSend: true,
};

describe('EmployeeReminders policy gates', () => {
  it('gates and decorates the daily employee reminder for the current owner', async () => {
    const sender = { sendReminder: vi.fn().mockResolvedValue(undefined) };
    const policy = {
      execute: vi
        .fn()
        .mockResolvedValue({ enabled: true, welcomeMessage: 'Welcome' }),
    };
    const useCase = new SendEmployeeReminderEmail(
      sender as never,
      policy as never,
    );

    await expect(
      useCase.execute({ input: { reminder }, requestContext: context }),
    ).resolves.toEqual({ sent: true });
    expect(policy.execute).toHaveBeenCalledWith({
      input: { code: 'employee_daily_reminder' },
      requestContext: context,
    });
    expect(sender.sendReminder).toHaveBeenCalledWith({
      to: ['ana@acme.test'],
      reminder,
      welcomeMessage: 'Welcome',
      requestContext: context,
    });
  });

  it('gates the assigned-document notification and never sends while disabled', async () => {
    const sender = { sendNewDocument: vi.fn() };
    const policy = {
      execute: vi
        .fn()
        .mockResolvedValue({ enabled: false, welcomeMessage: 'Welcome' }),
    };
    const useCase = new NotifyNewDocument(sender as never, policy as never);
    const input = {
      ownerId: 41,
      employeeId: 8,
      employeeName: 'Ana',
      employeeEmail: 'ana@acme.test',
      companyName: 'Acme',
      documents: [{ documentId: 1, documentTitle: 'Policy' }],
    };

    await expect(
      useCase.execute({ input, requestContext: context }),
    ).resolves.toEqual({ notified: false });
    expect(policy.execute).toHaveBeenCalledWith({
      input: { code: 'employee_document_assigned' },
      requestContext: context,
    });
    expect(sender.sendNewDocument).not.toHaveBeenCalled();
  });
});
