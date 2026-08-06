import { dailyReportController } from '../../dailyReport.di';

export const DailyReportRoutes = () => {
  const { generateManual } = dailyReportController();

  return {
    dailyReport: {
      generateManual,
    },
  };
};
