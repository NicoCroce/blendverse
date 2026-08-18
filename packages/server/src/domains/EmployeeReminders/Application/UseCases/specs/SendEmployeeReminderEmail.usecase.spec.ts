import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { SendEmployeeReminderEmail } from '../SendEmployeeReminderEmail.usecase';
import type { IEmployeeReminder } from '../../../Domain/EmployeeReminder.entity';

const requestContext = new RequestContext(1, 'req-1', 42);
const enabledPolicy = {
  execute: vi
    .fn()
    .mockResolvedValue({ enabled: true, welcomeMessage: 'Welcome' }),
};

const buildReminder = (
  overrides: Partial<IEmployeeReminder> = {},
): IEmployeeReminder => ({
  ownerId: 42,
  employeeId: 5,
  employeeName: 'Carlos Gómez',
  employeeEmail: 'carlos@test.com',
  companyName: 'Acme S.A.',
  date: '2026-08-07',
  pending: {
    unsignedDocuments: [{ documentId: 1, documentTitle: 'Recibo' }],
    unviewedDocuments: [],
    pendingDisclaimerAcceptance: false,
    renewPassword: false,
  },
  shouldSend: true,
  ...overrides,
});

describe('SendEmployeeReminderEmail (FR-008/FR-009 — envío condicional)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sends the email and returns { sent: true } when shouldSend is true', async () => {
    const sender = { sendReminder: vi.fn().mockResolvedValue(undefined) };
    const useCase = new SendEmployeeReminderEmail(
      sender as never,
      enabledPolicy as never,
    );

    const result = await useCase.execute({
      input: { reminder: buildReminder() },
      requestContext,
    });

    expect(result).toEqual({ sent: true });
    expect(sender.sendReminder).toHaveBeenCalledWith({
      to: ['carlos@test.com'],
      reminder: buildReminder(),
      welcomeMessage: 'Welcome',
      requestContext,
    });
  });

  it('skips the email when shouldSend is false (FR-008)', async () => {
    const sender = { sendReminder: vi.fn() };
    const useCase = new SendEmployeeReminderEmail(
      sender as never,
      enabledPolicy as never,
    );

    const result = await useCase.execute({
      input: {
        reminder: buildReminder({
          pending: {
            unsignedDocuments: [],
            unviewedDocuments: [],
            pendingDisclaimerAcceptance: false,
            renewPassword: false,
          },
          shouldSend: false,
        }),
      },
      requestContext,
    });

    expect(result).toEqual({ sent: false });
    expect(sender.sendReminder).not.toHaveBeenCalled();
  });

  it('skips the email when the employee email is invalid (FR-009)', async () => {
    const sender = { sendReminder: vi.fn() };
    const useCase = new SendEmployeeReminderEmail(
      sender as never,
      enabledPolicy as never,
    );

    const result = await useCase.execute({
      input: {
        reminder: buildReminder({ employeeEmail: 'sin-correo' }),
      },
      requestContext,
    });

    expect(result).toEqual({ sent: false });
    expect(sender.sendReminder).not.toHaveBeenCalled();
  });

  it('propagates errors from the email sender', async () => {
    const sender = {
      sendReminder: vi.fn().mockRejectedValue(new Error('SMTP down')),
    };
    const useCase = new SendEmployeeReminderEmail(
      sender as never,
      enabledPolicy as never,
    );

    await expect(
      useCase.execute({
        input: { reminder: buildReminder() },
        requestContext,
      }),
    ).rejects.toThrow('SMTP down');
  });
});
