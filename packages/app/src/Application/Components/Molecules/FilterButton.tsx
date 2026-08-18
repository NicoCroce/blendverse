import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from './Button';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { ButtonProps } from '../ui/button';
import { useGetFiltersSetted } from '@app/Application/Hooks';

export interface FilterButtonProps {
  onClick: () => void;
  variant?: ButtonProps['variant'];
  ignoreParams?: string[];
}

export const FilterButton = ({
  onClick,
  variant = 'outline',
  ignoreParams = [],
}: FilterButtonProps) => {
  const hasFilters = useGetFiltersSetted(ignoreParams);

  return (
    <Button className="relative p-4" onClick={onClick} variant={variant}>
      {hasFilters && (
        <span className="w-2.5 h-2.5 bg-destructive rounded-full absolute top-[-3px] right-[-3px] ring-2 ring-background"></span>
      )}
      <FontAwesomeIcon icon={faFilter}></FontAwesomeIcon>
    </Button>
  );
};
