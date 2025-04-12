const CURRENCY_MAP = {
  0: { locale: 'es-AR', currency: 'ARS' },
  1: { locale: 'es-AR', currency: 'USD' },
} as const;

type TCurrencyMap = typeof CURRENCY_MAP;

/** 0 = AR / 1 = US */
type TCurrencyKey = keyof TCurrencyMap;
/** "ARS" | "USD" */
type TCurrency = TCurrencyMap[TCurrencyKey]['currency'];
/** "es-AR" */
type TLocale = TCurrencyMap[TCurrencyKey]['locale'];

interface FormatCurrencyParams {
  locale: TLocale;
  currency: TCurrency;
}

/** METHODS */

const formatCurrency =
  ({ locale, currency }: FormatCurrencyParams) =>
  (amount: string | number = 0) => {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
    });

    return formatter.format(Number(amount));
  };

const formatPercent = (number: number) => {
  const formatter = new Intl.NumberFormat('es-AR', {
    style: 'percent',
    minimumFractionDigits: 2,
  });

  return formatter.format(number / 100);
};

const getMappedCurrency = (currentCurrency: TCurrencyKey) =>
  CURRENCY_MAP[currentCurrency];

export const formatDate = (date: Date) => {
  const formatter = new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    day: 'numeric',
  });

  return formatter.format(new Date(date));
};

export const format = {
  /** 🟢 This function format number to ARS */
  ARS: formatCurrency(getMappedCurrency(0)),
  /** 🟢 This function format number to USD */
  USD: formatCurrency(getMappedCurrency(1)),
  /** 🟢 This function format number to a specific currency */
  toCurrency: (currentCurrency: TCurrencyKey, amount: number | string) =>
    formatCurrency(getMappedCurrency(currentCurrency))(amount),
  /** 🟢 This function format number to % */
  percent: formatPercent,
};
