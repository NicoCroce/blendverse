import { useState } from 'react';
import { Container, Text } from '@app/Application';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@app/Application/Components/ui/dialog';
import {
  CheckCircle2,
  Clock,
  FileText,
  Paperclip,
  CalendarCheck,
  BedDouble,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
import { CertificateDateRange } from './CertificateDateRange';
import { TCertificate } from '../../Certificate.entity';

interface CertificateProps {
  data: TCertificate;
  year: number;
  actions?: React.ReactNode;
}

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

const dayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
};

const isLeap = (year: number) =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const computeSpan = (
  startDate: string,
  endDate: string,
  year: number,
): { leftPct: number; widthPct: number } | undefined => {
  const start = parseEsArMonthDay(startDate, year);
  const end = parseEsArMonthDay(endDate, year);
  if (!start || !end) return undefined;

  const yearLen = isLeap(year) ? 366 : 365;
  const startDoy = dayOfYear(start);
  const endDoy = dayOfYear(end);

  let leftPct = Math.max((startDoy - 1) / yearLen, 0) * 100;
  const endPct = endDoy < startDoy ? 100 : Math.min(endDoy / yearLen, 1) * 100;
  const widthPct = Math.max(endPct - leftPct, 1.5);
  leftPct = Math.min(leftPct, 100 - widthPct);
  return { leftPct, widthPct };
};

export const Certificate = ({ data, year, actions }: CertificateProps) => {
  const {
    startDate,
    endDate,
    returnDate,
    reason,
    type,
    requiresRest,
    status,
    files,
  } = data;
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const hasFiles = Array.isArray(files) && files.length > 0;
  const span = computeSpan(startDate, endDate, year);

  const statusConfig = {
    pendiente: {
      label: 'Pendiente',
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    aprobado: {
      label: 'Aprobado',
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-800 border-green-200',
    },
    rechazado: {
      label: 'Rechazado',
      icon: XCircle,
      color: 'bg-red-100 text-red-800 border-red-200',
    },
    validando: {
      label: 'Validando',
      icon: Search,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    eliminado: {
      label: 'Eliminado',
      icon: Trash2,
      color: 'bg-gray-100 text-gray-500 border-gray-200',
    },
  };

  const currentStatus = statusConfig[status || 'pendiente'];
  const isDeleted = status === 'eliminado';

  return (
    <>
      <Container
        block
        className={`group flex h-full flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md ${isDeleted ? 'pointer-events-none opacity-50' : ''}`}
      >
        <Container row justify="between" align="start" className="gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <FileText className="h-3.5 w-3.5" strokeWidth={2.25} />
            {type}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${currentStatus.color}`}
          >
            <currentStatus.icon className="h-3.5 w-3.5" strokeWidth={2} />
            {currentStatus.label}
          </span>
        </Container>

        <Container row justify="between" align="start" className="gap-3">
          <span
            className="inline-flex items-center gap-1 text-xs tabular-nums text-muted-foreground"
            title={`Reintegro: ${returnDate}`}
          >
            <CalendarCheck className="h-3.5 w-3.5" strokeWidth={2} />
            Reintegro: {returnDate}
          </span>
          {requiresRest && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <BedDouble className="h-3.5 w-3.5" strokeWidth={2} />
              Requiere reposo
            </span>
          )}
        </Container>

        {span && (
          <div
            className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted"
            role="presentation"
          >
            <div
              className="absolute top-0 h-full rounded-full bg-primary/80"
              style={{
                left: `${span.leftPct}%`,
                width: `${span.widthPct}%`,
              }}
            />
          </div>
        )}

        <CertificateDateRange
          startDate={startDate}
          endDate={endDate}
          year={year}
        />

        {reason && (
          <Text.Muted className="text-pretty leading-relaxed text-card-foreground">
            {reason}
          </Text.Muted>
        )}

        {hasFiles && (
          <Container block className="mt-auto pt-1">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-1.5">
              {files!.map((file) => (
                <button
                  key={file}
                  type="button"
                  onClick={() => setActiveFile(file)}
                  className="aspect-square overflow-hidden rounded bg-muted transition-transform duration-150 hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <img
                    src={file}
                    alt={`Adjunto del certificado ${type}`}
                    className="h-full w-full cursor-pointer object-cover"
                  />
                </button>
              ))}
            </div>
            <Text.Label className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Paperclip className="h-3 w-3" strokeWidth={2} />
              {files!.length} {files!.length === 1 ? 'adjunto' : 'adjuntos'}
            </Text.Label>
          </Container>
        )}

        {actions && (
          <Container block className="mt-auto border-t pt-2">
            {actions}
          </Container>
        )}
      </Container>
      <Dialog
        open={activeFile !== null}
        onOpenChange={(open) => !open && setActiveFile(null)}
      >
        <DialogContent className="max-w-3xl gap-0 p-2 sm:p-2">
          <DialogTitle className="sr-only">
            Adjunto del certificado {type}
          </DialogTitle>
          {activeFile && (
            <img
              src={activeFile}
              alt={`Adjunto del certificado ${type}`}
              className="max-h-[80vh] w-full rounded object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
