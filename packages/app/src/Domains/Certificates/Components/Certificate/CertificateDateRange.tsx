import { CalendarDays } from 'lucide-react';

const MONTHS_ES: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  setiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

const parseEsArMonthDay = (value: string, year: number): Date | undefined => {
  const match = value.toLowerCase().match(/(\d{1,2})\s+de\s+([a-záéíóú]+)/);
  if (!match) return undefined;
  const [, dayStr, monthName] = match;
  const month = MONTHS_ES[monthName];
  if (month === undefined) return undefined;
  return new Date(year, month, Number(dayStr));
};

interface CertificateDateRangeProps {
  startDate: string;
  endDate: string;
  year: number;
}

export const CertificateDateRange = ({
  startDate,
  endDate,
  year,
}: CertificateDateRangeProps) => {
  const start = parseEsArMonthDay(startDate, year);
  const end = parseEsArMonthDay(endDate, year);
  const daysDiff =
    start && end
      ? Math.max(
          Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1,
          1,
        )
      : null;

  return (
    <span className="inline-flex w-full items-center justify-between gap-2 text-xs tabular-nums text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <CalendarDays className="h-3.5 w-3.5" strokeWidth={2} />
        {startDate} → {endDate}
      </span>
      {daysDiff !== null && (
        <span className="font-medium">
          {daysDiff} {daysDiff === 1 ? 'día' : 'días'}
        </span>
      )}
    </span>
  );
};
