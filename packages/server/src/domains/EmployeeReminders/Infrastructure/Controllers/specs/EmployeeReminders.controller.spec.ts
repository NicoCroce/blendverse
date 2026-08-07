import { describe, expect, it, vi } from 'vitest';
import { RequestContext } from '@server/Application';
import { EmployeeRemindersController } from '../EmployeeReminders.controller';

vi.mock('@server/Infrastructure', async () => {
  const { router, protectedProcedure } =
    await import('@server/Infrastructure/trpc/TrpcInstance.js');
  return { router, protectedProcedure };
});

vi.mock('@server/Infrastructure/utils/JWT', () => ({
  generateToken: vi.fn(() => 'signed-token'),
  verifyToken: vi.fn(() => ({ id: 1, ownerId: 10 })),
}));

vi.mock('@server/Infrastructure/utils/pino', () => ({
  loggerContextInput: () => ({ info: vi.fn() }),
  loggerContext: () => ({ info: vi.fn(), error: vi.fn() }),
  logger: { info: vi.fn(), error: vi.fn() },
}));

import { router } from '@server/Infrastructure';

const requestContext = new RequestContext(1, 'req-test', 10);

const buildCaller = (sendDailyReminders = vi.fn()) => {
  const controller = new EmployeeRemindersController({
    sendDailyReminders,
  } as never);

  const employeeRemindersRouter = router({
    sendDailyReminders: controller.sendDailyReminders,
  });

  return {
    sendDailyReminders,
    caller: employeeRemindersRouter.createCaller({
      requestContext,
      cookies: { auth_token: 'mock-token' },
      res: {},
    } as never),
  };
};

describe('EmployeeRemindersController — sendDailyReminders (trigger manual)', () => {
  it('delegates to the service with the requestContext (multi-tenant ownerId via context)', async () => {
    const serviceResponse = {
      sent: 3,
      skipped: 1,
      failed: 0,
      totalOwners: 2,
    };
    const { caller, sendDailyReminders } = buildCaller(
      vi.fn().mockResolvedValue(serviceResponse),
    );

    const result = await caller.sendDailyReminders();

    expect(sendDailyReminders).toHaveBeenCalledTimes(1);
    expect(sendDailyReminders).toHaveBeenCalledWith({ requestContext });
    expect(
      sendDailyReminders.mock.calls[0][0].requestContext.values.ownerId,
    ).toBe(10);
    expect(result).toMatchObject(serviceResponse);
  });

  it('propagates errors from the service as a rejected call', async () => {
    const { caller } = buildCaller(
      vi.fn().mockRejectedValue(new Error('SMTP down')),
    );

    await expect(caller.sendDailyReminders()).rejects.toThrow('SMTP down');
  });
});
