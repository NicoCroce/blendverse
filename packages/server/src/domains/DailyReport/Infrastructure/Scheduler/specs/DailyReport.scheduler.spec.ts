import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { DailyReportScheduler } from '../DailyReport.scheduler';
import { DailyReportService } from '../../../Application/DailyReport.service';

const mocks = vi.hoisted(() => ({
  schedule: vi.fn(),
}));

vi.mock('node-cron', () => ({
  __esModule: true,
  default: { schedule: mocks.schedule },
  schedule: mocks.schedule,
}));

const buildTaskMock = () => ({
  stop: vi.fn(),
  start: vi.fn(),
  now: vi.fn(),
  on: vi.fn(),
  emit: vi.fn(),
});

const buildServiceMock = () => ({
  sendDailyReport: vi.fn().mockResolvedValue({ sent: 1, failed: 0, total: 1 }),
});

describe('DailyReportScheduler (FR-001/FR-015 — cron diario 9:00 AM Argentina)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.schedule.mockReturnValue(buildTaskMock() as never);
  });

  it('registers the cron expression "0 9 * * *" with the Argentina timezone', () => {
    const scheduler = new DailyReportScheduler(
      buildServiceMock() as unknown as DailyReportService,
    );

    scheduler.init();

    expect(mocks.schedule).toHaveBeenCalledTimes(1);
    const [expression, , options] = mocks.schedule.mock.calls[0] as [
      string,
      () => Promise<void>,
      { timezone?: string },
    ];
    expect(expression).toBe('0 9 * * *');
    expect(options.timezone).toBe('America/Argentina/Buenos_Aires');
  });

  it('does not register the cron again when already initialized', () => {
    const scheduler = new DailyReportScheduler(
      buildServiceMock() as unknown as DailyReportService,
    );

    scheduler.init();
    scheduler.init();

    expect(mocks.schedule).toHaveBeenCalledTimes(1);
  });

  it('executes the daily report job with a synthetic system RequestContext (ownerId 0)', async () => {
    const serviceMock = buildServiceMock();
    const scheduler = new DailyReportScheduler(
      serviceMock as unknown as DailyReportService,
    );

    scheduler.init();

    const callback = mocks.schedule.mock.calls[0][1] as () => Promise<void>;
    await callback();

    expect(serviceMock.sendDailyReport).toHaveBeenCalledTimes(1);
    const { requestContext } = serviceMock.sendDailyReport.mock.calls[0][0] as {
      requestContext: RequestContext;
    };
    expect(requestContext.values.ownerId).toBe(0);
    expect(requestContext.values.requestId).toMatch(/^daily-report-/);
  });

  it('stop() stops the scheduled task and clears the reference', () => {
    const taskMock = buildTaskMock();
    mocks.schedule.mockReturnValue(taskMock as never);
    const scheduler = new DailyReportScheduler(
      buildServiceMock() as unknown as DailyReportService,
    );

    scheduler.init();
    scheduler.stop();

    expect(taskMock.stop).toHaveBeenCalledTimes(1);

    // Tras el stop, un nuevo init vuelve a registrar el cron
    scheduler.init();
    expect(mocks.schedule).toHaveBeenCalledTimes(2);
  });
});
