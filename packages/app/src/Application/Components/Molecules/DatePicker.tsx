'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/Application/lib/utils';
import { Button } from '@/Application/Components/ui/button';
import { Calendar } from '@/Application/Components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/Application/Components/ui/popover';
import { Container } from '../Layout';

interface DatePickerProps {
  onClose: (date: Date) => void;
  value?: string;
}

export const DatePicker = ({ onClose, value }: DatePickerProps) => {
  const [date, setDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined,
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    setDate(selectedDate);
    onClose(selectedDate);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-[240px] justify-start text-left font-normal',
            !date && 'text-muted-foreground',
          )}
        >
          <Container row space="small" align="center">
            <CalendarIcon />
            {date ? (
              format(date, 'PPP', { locale: es })
            ) : (
              <span>Seleccionar Fecha</span>
            )}
          </Container>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          locale={es} // Añadimos el locale al calendario
          weekStartsOn={1} // La semana empieza en lunes (opcional)
          formatters={{
            formatCaption: (date) => format(date, 'LLLL yyyy', { locale: es }),
            formatWeekdayName: (date) => format(date, 'EEEEEE', { locale: es }),
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
