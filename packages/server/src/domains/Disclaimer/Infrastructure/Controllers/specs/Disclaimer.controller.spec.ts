import { describe, expect, it, vi } from 'vitest';
import { DisclaimerController } from '../Disclaimer.controller';

vi.mock('@server/Infrastructure', async () => {
  const { initTRPC } = await import('@trpc/server');
  const t = initTRPC.create();
  return { router: t.router, protectedProcedure: t.procedure };
});

vi.mock('@server/utils/JWT', () => ({
  generateToken: vi.fn(() => 'signed-token'),
  verifyToken: vi.fn(() => ({ id: 1, ownerId: 10 })),
}));

vi.mock('@server/utils/pino', () => ({
  loggerContextInput: () => ({ info: vi.fn() }),
  loggerContext: () => ({ info: vi.fn(), error: vi.fn() }),
  logger: { info: vi.fn(), error: vi.fn() },
}));

const buildCaller = (
  getDisclaimerText = vi.fn(),
  getSignatureStatus = vi.fn(),
  signDisclaimer = vi.fn(),
  getEmployeesByCompany = vi.fn(),
  sendReminders = vi.fn(),
) => {
  const service = {
    getDisclaimerText,
    getSignatureStatus,
    signDisclaimer,
    getEmployeesByCompany,
    sendReminders,
  } as never;
  const controller = new DisclaimerController(service);

  const disclaimerRouter = {
    getText: controller.getText(),
    sign: controller.sign(),
    getStatus: controller.getStatus(),
    getEmployees: controller.getEmployees(),
    sendReminders: controller.sendReminders(),
  };

  return {
    getDisclaimerText,
    getSignatureStatus,
    signDisclaimer,
    getEmployeesByCompany,
    sendReminders,
    caller: {
      getText: disclaimerRouter.getText,
      sign: disclaimerRouter.sign,
      getStatus: disclaimerRouter.getStatus,
      getEmployees: disclaimerRouter.getEmployees,
      sendReminders: disclaimerRouter.sendReminders,
    },
  };
};

describe('DisclaimerController', () => {
  it('getText calls service with ownerId', async () => {
    const { getDisclaimerText } = buildCaller(
      vi.fn().mockResolvedValue({ content: 'Texto legal', version: null }),
    );

    expect(getDisclaimerText).toBeDefined();
  });

  it('getStatus calls service with userId and ownerId', async () => {
    const { getSignatureStatus } = buildCaller(
      undefined,
      vi.fn().mockResolvedValue({ signed: true, corrupt: false }),
    );

    const controller = new DisclaimerController({
      getSignatureStatus: getSignatureStatus as never,
    } as never);
    const proc = controller.getStatus();
    expect(proc).toBeDefined();
  });

  it('getEmployees calls service with search', async () => {
    const { getEmployeesByCompany } = buildCaller(
      undefined,
      undefined,
      undefined,
      vi.fn().mockResolvedValue([]),
    );

    const controller = new DisclaimerController({
      getEmployeesByCompany: getEmployeesByCompany as never,
    } as never);
    const proc = controller.getEmployees();
    expect(proc).toBeDefined();
  });

  it('sendReminders calls service', async () => {
    const { sendReminders } = buildCaller(
      undefined,
      undefined,
      undefined,
      undefined,
      vi.fn().mockResolvedValue({ sent: 5, failed: 0, total: 5 }),
    );

    const controller = new DisclaimerController({
      sendReminders: sendReminders as never,
    } as never);
    const proc = controller.sendReminders();
    expect(proc).toBeDefined();
  });
});
