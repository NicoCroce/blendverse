import { uuid } from '@app/Aplication/Helpers';
import {
  Select as SelectLib,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export type TOptions = {
  value: string;
  label: string;
};

interface SelectProps {
  placeholder: string;
  onValueChange: (value: string) => void;
  options: TOptions[];
  defaultValue: string;
  forceEnabled?: boolean;
}

export const Select = ({
  options,
  placeholder,
  onValueChange,
  defaultValue,
  forceEnabled = false,
}: SelectProps) => {
  return (
    <SelectLib onValueChange={onValueChange} defaultValue={defaultValue}>
      <SelectTrigger className="w-20" forceEnabled={forceEnabled}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map(({ value, label }) => (
            <SelectItem key={uuid()} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </SelectLib>
  );
};
