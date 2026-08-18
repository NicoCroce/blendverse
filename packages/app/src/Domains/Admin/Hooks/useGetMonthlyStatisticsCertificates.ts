import { CertificatesService } from '@app/Domains/Certificates';

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export type TMonthlyLicensesByType = {
  name: string;
  count: number;
};

export type TMonthlyLicensesData = {
  month: string;
  count: number;
  byType: TMonthlyLicensesByType[];
};

const getDefaultYear = (availableYears: number[]) => {
  const currentYear = new Date().getFullYear();
  if (availableYears.includes(currentYear)) return currentYear;
  return availableYears[0] ?? currentYear;
};

export const useGetMonthlyStatisticsCertificates = (selectedYear?: number) => {
  const bootstrapQuery = CertificatesService.getStatisticsMonthly.useQuery({
    year: undefined,
  });

  const availableYears = bootstrapQuery.data?.availableYears ?? [];
  const resolvedYear =
    selectedYear ??
    (bootstrapQuery.isSuccess && availableYears.length > 0
      ? getDefaultYear(availableYears)
      : undefined);

  const response = CertificatesService.getStatisticsMonthly.useQuery(
    { year: resolvedYear },
    { enabled: selectedYear !== undefined || bootstrapQuery.isSuccess },
  );

  const activeResponse =
    selectedYear !== undefined || bootstrapQuery.isSuccess
      ? response
      : bootstrapQuery;

  const dataChart: TMonthlyLicensesData[] =
    activeResponse.data?.months.map(({ month, count, byType }) => ({
      month: MONTH_NAMES[month - 1] ?? String(month),
      count,
      byType,
    })) ?? [];

  return {
    dataChart,
    year: activeResponse.data?.year ?? new Date().getFullYear(),
    availableYears,
    ...activeResponse,
  };
};
