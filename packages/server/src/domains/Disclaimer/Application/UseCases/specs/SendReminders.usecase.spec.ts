import { describe, expect, it, vi } from 'vitest';
import { RequestContext } from '@server/Application';
import { SendReminders } from '../SendReminders.usecase';

const requestContext = new RequestContext(1, 'req-1', 99);

describe('SendReminders', () => {
  it('sends emails to all pending employees', async () => {
    const mockRepo = {
      getPendingEmployeeIds: vi.fn().mockResolvedValue([1, 2, 3]),
    };
    const mockUserRepo = {
      getEmailsByUsersId: vi
        .fn()
        .mockResolvedValue([
          'juan@test.com',
          'maria@test.com',
          'carlos@test.com',
        ]),
    };
    const mockEmailSender = {
      sendReminder: vi.fn().mockResolvedValue(undefined),
    };
    const mockOwnersysRepo = {
      getOwnersys: vi.fn().mockResolvedValue({
        values: {
          denominacion: 'Empresa Test',
          texto_disclaimer: 'Texto del disclaimer',
        },
      }),
    };
    const policy = { execute: vi.fn().mockResolvedValue({ enabled: true }) };
    const currentTerms = {
      execute: vi
        .fn()
        .mockResolvedValue({
          id: 12,
          version: 1,
          content: 'Texto del disclaimer',
        }),
    };

    const useCase = new SendReminders(
      mockRepo as never,
      mockUserRepo as never,
      mockEmailSender as never,
      mockOwnersysRepo as never,
      policy as never,
      currentTerms as never,
    );

    const result = await useCase.execute({
      input: {},
      requestContext,
    });

    expect(result.sent).toBe(3);
    expect(result.failed).toBe(0);
    expect(result.total).toBe(3);
    expect(policy.execute).toHaveBeenCalledWith({
      input: { code: 'employee_terms_reminder' },
      requestContext,
    });
    expect(mockEmailSender.sendReminder).toHaveBeenCalledWith({
      to: ['juan@test.com', 'maria@test.com', 'carlos@test.com'],
      disclaimerText: 'Texto del disclaimer',
      companyName: 'Empresa Test',
      requestContext,
    });
  });

  it('ignores a client-provided ownerId and uses the authenticated tenant context', async () => {
    const mockRepo = {
      getPendingEmployeeIds: vi.fn().mockResolvedValue([1]),
    };
    const mockUserRepo = {
      getEmailsByUsersId: vi.fn().mockResolvedValue(['juan@test.com']),
    };
    const mockEmailSender = {
      sendReminder: vi.fn().mockResolvedValue(undefined),
    };
    const mockOwnersysRepo = {
      getOwnersys: vi.fn().mockResolvedValue({
        values: {
          denominacion: 'Empresa Test',
          texto_disclaimer: 'Texto del disclaimer',
        },
      }),
    };
    const policy = { execute: vi.fn().mockResolvedValue({ enabled: true }) };
    const currentTerms = {
      execute: vi
        .fn()
        .mockResolvedValue({
          id: 12,
          version: 1,
          content: 'Texto del disclaimer',
        }),
    };

    const useCase = new SendReminders(
      mockRepo as never,
      mockUserRepo as never,
      mockEmailSender as never,
      mockOwnersysRepo as never,
      policy as never,
      currentTerms as never,
    );

    await useCase.execute({
      input: {},
      requestContext,
    });

    expect(mockRepo.getPendingEmployeeIds).toHaveBeenCalledWith({
      termsVersionId: 12,
      requestContext,
    });
  });
});
