import * as React from 'react';

import { Button } from '@/Aplication/Components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/Aplication/Components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/Aplication/Components/ui/popover';
import { cn } from '@app/Aplication/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faChevronDown } from '@fortawesome/free-solid-svg-icons';

type TOption = {
  value: string;
  label: string;
};

export interface ComboboxProps {
  options?: TOption[];
  value?: string;
  onChangeValue: (value: string) => void;
}

export const Combobox = ({
  value,
  onChangeValue,
  options = [],
}: ComboboxProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between uppercase',
            !value && 'text-muted-foreground',
          )}
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : 'Selecciona una opción'}
          <FontAwesomeIcon
            icon={faChevronDown}
            className="ml-2 h-4 w-4 shrink-0 opacity-50"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar..." />
          <CommandList>
            <CommandEmpty>Nada seleccionado</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onChangeValue(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  <FontAwesomeIcon
                    icon={faCheck}
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
