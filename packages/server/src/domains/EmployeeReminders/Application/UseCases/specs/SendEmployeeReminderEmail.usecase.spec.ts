import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { SendEmployeeReminderEmail } from '../SendEmployeeReminderEmail.usecase';
import type { IEmployeeReminder } from '../../../Domain/EmployeeReminder.entity';

const { employeeDailyReminderTemplate } = vi.hoisted(() => ({
  employeeDailyReminderTemplate: vi.fn(),
}));

vi.mock('@server/Infrastructure', () => ({
  emailTemplates: { employeeDailyReminder: employeeDailyReminderTemplate },
  isValidEmail: (email: string | null | undefined): boolean => {
    if (!email) return false;
    const trimmed = email.trim();
    if (trimmed === '') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  },
}));

const requestContext = new RequestContext(1, 'req-1', 42);

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
    employeeDailyReminderTemplate.mockReturnValue({
      subject: '[GestDoc] Tus pendientes — Acme S.A. — 2026-08-07',
      body: '<h1>Hola Carlos Gómez</h1>',
    });
    const sender = { send: vi.fn().mockResolvedValue(undefined) };
    const useCase = new SendEmployeeReminderEmail(sender);

    const result = await useCase.execute({
      input: { reminder: buildReminder() },
      requestContext,
    });

    expect(result).toEqual({ sent: true });
    expect(sender.send).toHaveBeenCalledOnce();
    const params = sender.send.mock.calls[0][0];
    expect(params.to).toEqual(['carlos@test.com']);
    expect(params.subject).toContain('Tus pendientes');
    expect(params.subject).toContain('Acme S.A.');
    expect(params.html).toContain('Carlos Gómez');
    expect(employeeDailyReminderTemplate).toHaveBeenCalledWith(buildReminder());
  });

  it('skips the email when shouldSend is false (FR-008)', async () => {
    const sender = { send: vi.fn() };
    const useCase = new SendEmployeeReminderEmail(sender);

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
    expect(sender.send).not.toHaveBeenCalled();
    expect(employeeDailyReminderTemplate).not.toHaveBeenCalled();
  });

  it('skips the email when the employee email is invalid (FR-009)', async () => {
    const sender = { send: vi.fn() };
    const useCase = new SendEmployeeReminderEmail(sender);

    const result = await useCase.execute({
      input: {
        reminder: buildReminder({ employeeEmail: 'sin-correo' }),
      },
      requestContext,
    });

    expect(result).toEqual({ sent: false });
    expect(sender.send).not.toHaveBeenCalled();
    expect(employeeDailyReminderTemplate).not.toHaveBeenCalled();
  });

  it('propagates errors from the email sender', async () => {
    employeeDailyReminderTemplate.mockReturnValue({
      subject: 'subject',
      body: 'body',
    });
    const sender = {
      send: vi.fn().mockRejectedValue(new Error('SMTP down')),
    };
    const useCase = new SendEmployeeReminderEmail(sender);

    await expect(
      useCase.execute({
        input: { reminder: buildReminder() },
        requestContext,
      }),
    ).rejects.toThrow('SMTP down');
  });
});
