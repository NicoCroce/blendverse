import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequestContext } from '@server/Application';
import { SendReportEmail } from '../SendReportEmail.usecase';

const context = new RequestContext(0, 'manual-report', 41);

describe('SendReportEmail delivery policy gate', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses tenant recipients and decorates after rendering and before sending', async () => {
    const sender = { send: vi.fn().mockResolvedValue(undefined) };
    const policy = {
      execute: vi
        .fn()
        .mockResolvedValue({
          enabled: true,
          recipients: ['ops@acme.test'],
          welcomeMessage: 'Welcome',
        }),
    };
    const useCase = new SendReportEmail(sender as never, policy as never);
    const report = { values: { ownerId: 41, companyName: 'Acme' } };

    const result = await useCase.execute({
      input: { report } as never,
      requestContext: context,
    });

    expect(result).toEqual({ success: true });
    expect(policy.execute).toHaveBeenCalledWith({
      input: { code: 'admin_daily_report' },
      requestContext: context,
    });
    expect(sender.send).toHaveBeenCalledWith({
      to: ['ops@acme.test'],
      report,
      welcomeMessage: 'Welcome',
      requestContext: context,
    });
  });

  it('does not render or send a disabled route', async () => {
    const sender = { send: vi.fn() };
    const policy = {
      execute: vi
        .fn()
        .mockResolvedValue({
          enabled: false,
          recipients: ['ops@acme.test'],
          welcomeMessage: 'Welcome',
        }),
    };
    const useCase = new SendReportEmail(sender as never, policy as never);

    await expect(
      useCase.execute({
        input: { report: { values: {} } } as never,
        requestContext: context,
      }),
    ).resolves.toEqual({ success: false });
    expect(sender.send).not.toHaveBeenCalled();
  });
});
