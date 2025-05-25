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
import { useState } from 'react';
import { Spinner } from '../../Molecules';
import { Container } from '../../Layout';

type TOption = {
  value: string;
  label: string;
};

export interface ComboboxBigSearchProps {
  options?: TOption[];
  value?: string;
  onChangeValue: (value: string) => void;
  onChangeFilter: (value: string) => void;
  isLoading?: boolean;
}

export const ComboboxBigSearch = ({
  value,
  onChangeValue,
  options = [],
  onChangeFilter,
  isLoading = false,
}: ComboboxBigSearchProps) => {
  const [open, setOpen] = useState(false);
  const [valueSearch, setValuSearch] = useState('');

  const handleOpenChange = (state: boolean) => {
    if (!value && !state) {
      onChangeValue('');
    }
    setOpen(state);
  };

  const handleInputSearch = (valueInputSearch: string) => {
    setValuSearch(valueInputSearch);
    onChangeFilter(valueInputSearch);
    const findSelected = options.find(
      (option) => option.value === value,
    )?.label;
    if (!findSelected) onChangeValue('');
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
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
          {value && options && options.length > 0
            ? options.find((option) => option.value === value)?.label ||
              'Selecciona una opción'
            : 'Selecciona una opción'}
          <FontAwesomeIcon
            icon={faChevronDown}
            className="ml-2 h-4 w-4 shrink-0 opacity-50"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            onValueChange={handleInputSearch}
            value={valueSearch}
            placeholder="Buscar..."
          />
          <CommandList>
            {isLoading ? (
              <Container row justify="center" className="m-4">
                <Spinner />
              </Container>
            ) : (
              <CommandEmpty>Nada seleccionado</CommandEmpty>
            )}

            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={(currentLabel) => {
                    const selected = options.find(
                      (opt) => opt.label === currentLabel,
                    );
                    onChangeValue(selected ? selected.value : '');
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
