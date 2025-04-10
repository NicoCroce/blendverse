import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from './Button';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { ButtonProps } from '../ui/button';
import { useGetFiltersSetted } from '@app/Aplication/Hooks';

export interface FilterButtonProps {
  onClick: () => void;
  variant?: ButtonProps['variant'];
  ignoreParams?: string[];
}

export const FilterButton = ({
  onClick,
  variant = 'secondary',
  ignoreParams = [],
}: FilterButtonProps) => {
  const hasFilters = useGetFiltersSetted(ignoreParams);

  return (
    <Button className="relative" onClick={onClick} variant={variant}>
      {hasFilters && (
        <span className="w-3 h-3 bg-red-700 rounded-full absolute top-[-4px] right-[-4px]"></span>
      )}
      <FontAwesomeIcon icon={faFilter}></FontAwesomeIcon>
    </Button>
  );
};
